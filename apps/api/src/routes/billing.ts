import { Router } from 'express';
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
const APP_URL = process.env.APP_URL;

if (!STRIPE_SECRET_KEY) {
	logger.error('STRIPE_SECRET_KEY is not set - exiting');
	process.exit(1);
}

if (!APP_URL) {
	logger.error('APP_URL is not set - exiting');
	process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

const ALLOWED_PRICE_IDS = new Set([
	'price_1TTaIICwR3az2cfPcZX3pnQa', // monthly
	'price_1TTaIICwR3az2cfPe9K8Fwv8', // yearly
	'price_1TTaIsCwR3az2cfPP6lFyo8X', // premium monthly
	'price_1TTaJECwR3az2cfPOdqiZXFp', // premium yearly
]);

const checkoutSchema = z.object({
	priceId: z.string().min(1),
});

const router = Router();

router.post('/checkout', requireAuth, async (req, res) => {
	const parsed = checkoutSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({
			ok: false,
			error: 'Invalid request body',
			details: parsed.error.format(),
		});
		return;
	}

	const { priceId } = parsed.data;
	if (!ALLOWED_PRICE_IDS.has(priceId)) {
		res.status(400).json({
			ok: false,
			error: 'Unknown priceId',
		});
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
			metadata: {
				supabase_user_id: user.id,
			},
			success_url: `${APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${APP_URL}/pricing?canceled=1`,
			allow_promotion_codes: true,
		});

		if (!session.url) {
			logger.error({ session }, 'Stripe returned a session without a URL');
			res
				.status(502)
				.json({ ok: false, error: 'Stripe did not return a checkout URL' });
			return;
		}

		res.json({ ok: true, data: { url: session.url } });
	} catch (err) {
		logger.error({ err }, 'checkout session creation error');
		const message = err instanceof Error ? err.message : 'Unknown error';
		res.status(500).json({ ok: false, error: message });
	}
});

export default router;
