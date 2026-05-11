/**
 *
 * POST /billing/checkout
 * Authenticated. Creates a Stripe Checkout Session.
 *
 * POST /billing/webhook
 * Public. Validates Stripe signature and updates subscriptions table.
 *
 * IMPORTANT: this route uses raw body parsing — registered BEFORE express.json
 * applies. The router is mounted in index.ts with raw middleware on this path.
 */

import { createClient } from '@supabase/supabase-js';
import { Router, raw } from 'express';
import pino from 'pino';
import Stripe from 'stripe';
import { z } from 'zod';
import { type AuthRequest, requireAuth } from '../middleware/auth.js';

const logger = pino(
	process.env.NODE_ENV !== 'production'
		? { transport: { target: 'pino-pretty' } }
		: {},
);

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const APP_URL = process.env.APP_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!STRIPE_SECRET_KEY) {
	logger.error('STRIPE_SECRET_KEY is not set - exiting');
	process.exit(1);
}
if (!STRIPE_WEBHOOK_SECRET) {
	logger.error('STRIPE_WEBHOOK_SECRET is not set - exiting');
	process.exit(1);
}
if (!APP_URL) {
	logger.error('APP_URL is not set - exiting');
	process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	logger.error(
		'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set - exiting',
	);
	process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
	SUPABASE_URL as string,
	SUPABASE_SERVICE_ROLE_KEY as string,
	{
		auth: { autoRefreshToken: false, persistSession: false },
	},
);
const ALLOWED_PRICE_IDS = new Set([
	'price_1TTaIICwR3az2cfPcZX3pnQa', // monthly
	'price_1TTaIICwR3az2cfPe9K8Fwv8', // yearly
	'price_1TTaIsCwR3az2cfPP6lFyo8X', // premium monthly
	'price_1TTaJECwR3az2cfPOdqiZXFp', // premium yearly
]);

const PRICE_TO_PLAN: Record<
	string,
	{ planId: 'plus' | 'premium'; interval: 'monthly' | 'yearly' }
> = {
	price_1TTaIICwR3az2cfPcZX3pnQa: { planId: 'plus', interval: 'monthly' },
	price_1TTaIICwR3az2cfPe9K8Fwv8: { planId: 'plus', interval: 'yearly' },
	price_1TTaIsCwR3az2cfPP6lFyo8X: { planId: 'premium', interval: 'monthly' },
	price_1TTaJECwR3az2cfPOdqiZXFp: { planId: 'premium', interval: 'yearly' },
};

const checkoutSchema = z.object({
	priceId: z.string().min(1),
});

const router = Router();

router.post('/checkout', requireAuth, async (req, res) => {
	const parsed = checkoutSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({
			ok: false,
			error: { message: 'Invalid request body' },
		});
		return;
	}

	const { priceId } = parsed.data;
	if (!ALLOWED_PRICE_IDS.has(priceId)) {
		res.status(400).json({ ok: false, error: { message: 'Unknown priceId' } });
		return;
	}

	const { user } = req as AuthRequest;

	try {
		const session = await stripe.checkout.sessions.create({
			mode: 'subscription',
			payment_method_types: ['card'],
			line_items: [{ price: priceId, quantity: 1 }],
			customer_email: user.email,
			client_reference_id: user.id,
			metadata: { supabase_user_id: user.id },
			subscription_data: {
				metadata: { supabase_user_id: user.id },
			},
			success_url: `${APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${APP_URL}/subscribe?canceled=1`,
			allow_promotion_codes: true,
		});

		if (!session.url) {
			logger.error({ session }, 'Stripe returned a session without a URL');
			res.status(502).json({
				ok: false,
				error: { message: 'Stripe did not return a checkout URL' },
			});
			return;
		}

		res.json({ ok: true, data: { url: session.url } });
	} catch (err) {
		logger.error({ err }, 'checkout session creation error');
		const message = err instanceof Error ? err.message : 'Unknown error';
		res.status(500).json({ ok: false, error: { message } });
	}
});

router.post('/webhook', raw({ type: 'application/json' }), async (req, res) => {
	const sig = req.headers['stripe-signature'];
	if (!sig || typeof sig !== 'string') {
		res.status(400).send('Missing stripe-signature header');
		return;
	}

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			sig,
			STRIPE_WEBHOOK_SECRET,
		);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		logger.warn({ err }, 'stripe webhook signature verification failed');
		res.status(400).send(`Webhook Error: ${message}`);
		return;
	}

	logger.info({ type: event.type, id: event.id }, 'stripe webhook received');

	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session;
				if (session.mode !== 'subscription') break;
				if (!session.subscription || !session.customer) break;

				const userId =
					session.client_reference_id || session.metadata?.supabase_user_id;
				if (!userId) {
					logger.error(
						{ sessionId: session.id },
						'checkout.session.completed missing user id',
					);
					break;
				}

				const subscriptionId =
					typeof session.subscription === 'string'
						? session.subscription
						: session.subscription.id;

				const subscription =
					await stripe.subscriptions.retrieve(subscriptionId);
				await upsertSubscription(userId, subscription);
				break;
			}

			case 'customer.subscription.updated':
			case 'customer.subscription.created': {
				const subscription = event.data.object as Stripe.Subscription;
				const userId = subscription.metadata?.supabase_user_id;
				if (!userId) {
					logger.warn(
						{ subscriptionId: subscription.id },
						'subscription event missing supabase_user_id metadata',
					);
					break;
				}
				await upsertSubscription(userId, subscription);
				break;
			}

			case 'customer.subscription.deleted': {
				const subscription = event.data.object as Stripe.Subscription;
				const { error } = await supabaseAdmin
					.from('subscriptions')
					.update({
						status: 'canceled',
						cancel_at_period_end: false,
					})
					.eq('stripe_subscription_id', subscription.id);

				if (error) {
					logger.error(
						{ error, subscriptionId: subscription.id },
						'failed to mark subscription canceled',
					);
				}
				break;
			}

			default:
				break;
		}

		res.json({ received: true });
	} catch (err) {
		logger.error({ err, eventType: event.type }, 'webhook handler error');
		res.status(500).send('Webhook handler failed');
	}
});

async function upsertSubscription(
	userId: string,
	subscription: Stripe.Subscription,
): Promise<void> {
	const item = subscription.items.data[0];
	if (!item) {
		logger.error(
			{ subscriptionId: subscription.id },
			'subscription has no items',
		);
		return;
	}

	const priceId = item.price.id;
	const planMapping = PRICE_TO_PLAN[priceId];
	if (!planMapping) {
		logger.error(
			{ priceId, subscriptionId: subscription.id },
			'unknown price id in subscription',
		);
		return;
	}

	const customerId =
		typeof subscription.customer === 'string'
			? subscription.customer
			: subscription.customer.id;

	const periodEnd = (
		subscription as Stripe.Subscription & { current_period_end?: number }
	).current_period_end;

	const { error } = await supabaseAdmin.from('subscriptions').upsert(
		{
			user_id: userId,
			stripe_customer_id: customerId,
			stripe_subscription_id: subscription.id,
			stripe_price_id: priceId,
			plan_id: planMapping.planId,
			billing_interval: planMapping.interval,
			status: subscription.status,
			current_period_end: periodEnd
				? new Date(periodEnd * 1000).toISOString()
				: null,
			cancel_at_period_end: subscription.cancel_at_period_end,
		},
		{ onConflict: 'stripe_subscription_id' },
	);

	if (error) {
		logger.error(
			{ error, userId, subscriptionId: subscription.id },
			'failed to upsert subscription',
		);
		throw error;
	}

	logger.info(
		{ userId, subscriptionId: subscription.id, status: subscription.status },
		'subscription upserted',
	);
}

router.get('/me', requireAuth, async (req, res) => {
	const { user } = req as AuthRequest;

	try {
		const { data, error } = await supabaseAdmin
			.from('subscriptions')
			.select('*')
			.eq('user_id', user.id)
			.in('status', ['active', 'trialing', 'past_due'])
			.maybeSingle();
		if (error) {
			logger.error({ error, userId: user.id }, 'failed to get subscription');
			res
				.status(500)
				.json({ ok: false, error: { message: 'Failed to get subscription' } });
			return;
		}
		res.json({ ok: true, data: { subscription: data } });
	} catch (err) {
		logger.error({ err, userId: user.id }, 'failed to get subscription');
		res
			.status(500)
			.json({ ok: false, error: { message: 'Failed to get subscription' } });
	}
});

router.post('/portal', requireAuth, async (req, res) => {
	const { user } = req as AuthRequest;
	try {
		const { data: sub, error } = await supabaseAdmin
			.from('subscriptions')
			.select('stripe_customer_id')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();

		if (error) {
			logger.error({ error, userId: user.id }, 'failed to fetch customer id');
			res
				.status(500)
				.json({ ok: false, error: { message: 'Failed to fetch customer' } });
			return;
		}

		if (!sub?.stripe_customer_id) {
			res.status(404).json({
				ok: false,
				error: { message: 'No subscription found. Please subscribe first.' },
			});
			return;
		}

		const session = await stripe.billingPortal.sessions.create({
			customer: sub.stripe_customer_id,
			return_url: `${APP_URL}/account`,
		});

		res.json({ ok: true, data: { url: session.url } });
	} catch (err) {
		logger.error({ err }, 'portal session creation error');
		const message = err instanceof Error ? err.message : 'Unknown error';
		res.status(500).json({ ok: false, error: { message } });
	}
});

export default router;
