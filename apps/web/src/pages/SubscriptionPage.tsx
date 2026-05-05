import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import {
	type BillingInterval,
	getEffectiveMonthly,
	getYearlySavingsPercent,
	PLANS,
	type Plan,
} from '../lib/plans';
import supabase from '../lib/supabase';

const SubscriptionPage = () => {
	const navigate = useNavigate();
	const [interval, setInterval] = useState<BillingInterval>('monthly');
	const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleSubscribe = async (plan: Plan) => {
		console.log('handleSubscribe called for plan:', plan.id);
		setError(null);

		if (plan.id === 'free') {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			navigate(session ? '/' : '/signup');
			return;
		}

		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session) {
			navigate('/login?redirect=/subscribe');
			return;
		}

		const priceId = plan.stripePriceIds[interval];
		if (!priceId) {
			setError('This plan is not available for the selected interval.');
			return;
		}

		setLoadingPlanId(plan.id);
		try {
			const { data } = await api.post('/billing/checkout', { priceId });
			if (data?.ok && data.data?.url) {
				window.location.href = data.data.url;
				return;
			}
			setError(data?.error?.message ?? 'Could not start checkout.');
		} catch (err) {
			console.error('checkout error', err);
			const message =
				err instanceof Error ? err.message : 'Network error during checkout.';
			setError(message);
		} finally {
			setLoadingPlanId(null);
		}
	};

	return (
		<main className={'min-h-screen bg-primary px-8 pt-28 pb-20'}>
			<section className={'mx-auto max-w-7xl'}>
				<div className={'text-center'}>
					<p
						className={
							'text-sm font-bold uppercase tracking-[0.26em] text-accent'
						}
					>
						CineVault Plans
					</p>
					<h1 className={'mt-4 text-4xl font-bold text-light-200 sm:text-5xl'}>
						Choose the plan that&apos;s right for you. <br />
						And start saving your favorite titles.
					</h1>
					<p className={'mx-auto my-4 max-w-2xl text-light-200'}>
						Start free, then unlock smarter recommendations, unlimited vault
						space, and advanced taste insights.
					</p>
				</div>

				<div className={'mt-10 flex justify-center'}>
					<div
						className={
							'inline-flex items-center gap-1 rounded-full border border-light-100/10 bg-dark-100/70 p-1'
						}
					>
						<button
							type={'button'}
							onClick={() => setInterval('monthly')}
							className={`rounded-full px-5 py-2 text-sm font-medium transition ${interval === 'monthly' ? 'bg-accent text-primary' : 'text-light-200 hover:text-light-100'}`}
						>
							Monthly
						</button>
						<button
							type={'button'}
							onClick={() => setInterval('yearly')}
							className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition ${interval === 'yearly' ? 'bg-accent text-primary' : 'text-light-200 hover:text-light-100'}`}
						>
							Yearly
							<span
								className={`rounded-full px-2 py-0.5 text-xs font-bold ${interval === 'yearly' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}
							>
								Save 17%
							</span>
						</button>
					</div>
				</div>

				{error && (
					<div
						className={
							'mx-auto mt-6 max-w-xl rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300'
						}
					>
						{error}
					</div>
				)}

				<div className={'mt-12 grid gap-6 md:grid-cols-3'}>
					{PLANS.map((plan) => {
						const isFree = plan.monthlyPrice === 0;
						const isYearly = interval === 'yearly';
						const savingsPct = getYearlySavingsPercent(plan);
						const effectiveMonthly = getEffectiveMonthly(plan);
						const isLoading = loadingPlanId === plan.id;

						const displayPrice = isFree
							? '$0'
							: isYearly
								? effectiveMonthly
								: `$${plan.monthlyPrice.toFixed(2)}`;
						const priceSuffix = isFree ? '' : '/mo';
						const billingNote = isFree
							? 'Free forever.'
							: isYearly
								? `Billed $${plan.yearlyPrice.toFixed(2)} yearly. Save ${savingsPct}%.`
								: `Billed $${plan.monthlyPrice.toFixed(2)} monthly. Cancel anytime.`;

						return (
							<article
								key={plan.id}
								className={`relative rounded-3xl border p-6 ${plan.popular ? 'border-accent bg-dark-100/90' : 'border-light-100/10 bg-dark-100/70'}`}
							>
								{plan.popular && (
									<div
										className={
											'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary'
										}
									>
										Most Popular
									</div>
								)}
								<p className={'text-xl font-bold text-light-100'}>
									{plan.name}
								</p>
								<div className={'mt-4 flex items-baseline gap-1'}>
									<span className={'text-4xl font-bold text-light-100'}>
										{displayPrice}
									</span>
									{priceSuffix && (
										<span className={'text-light-200'}>{priceSuffix}</span>
									)}
								</div>
								<p className={'mt-4 text-light-200'}>{plan.description}</p>
								<ul className={'mt-6 space-y-4'}>
									{plan.features.map((feature) => (
										<li key={feature} className={'text-light-200'}>
											✓ {feature}
										</li>
									))}
								</ul>
								<button
									type={'button'}
									onClick={() => handleSubscribe(plan)}
									disabled={isLoading || loadingPlanId !== null}
									className={`mt-6 w-full rounded-full px-4 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${plan.popular ? 'bg-accent text-primary hover:bg-accent/80' : 'bg-white/10 text-white hover:bg-white/20'}`}
								>
									{isLoading ? 'Redirecting…' : plan.cta}
								</button>
								<p className={'mt-6 text-sm text-light-200'}>{billingNote}</p>
							</article>
						);
					})}
				</div>
			</section>
		</main>
	);
};

export default SubscriptionPage;
