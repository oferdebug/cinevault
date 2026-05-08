import * as React from 'react';
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
	const [interval, setInterval] = React.useState<BillingInterval>('monthly');
	const [loadingPlanId, setLoadingPlanId] = React.useState<string | null>(null);
	const [error, setError] = React.useState<string | null>(null);

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
		<main className='min-h-screen bg-primary px-5 xs:px-8 pt-8 pb-20 relative overflow-hidden'>
			<div
				className='pointer-events-none absolute inset-0'
				style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(99,102,241,0.20), transparent)' }}
			/>
			<section className='mx-auto max-w-7xl relative z-10'>
				<div className='text-center mb-10'>
					<p className='text-xs font-semibold uppercase tracking-widest text-accent mb-3'>CineVault Plans</p>
					<h1 className='text-4xl sm:text-5xl'>
						Choose the plan that&apos;s right for you.
					</h1>
					<p className='mx-auto mt-4 max-w-2xl text-light-200/70 text-sm leading-7'>
						Start free, then unlock smarter recommendations, unlimited vault space, and advanced taste insights.
					</p>
				</div>

				<div className='flex justify-center mb-8'>
					<div className='inline-flex items-center gap-1 rounded-full border border-white/8 bg-surface-2/80 p-1 backdrop-blur-md'>
						<button
							type='button'
							onClick={() => setInterval('monthly')}
							className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
								interval === 'monthly' ? 'bg-accent text-primary' : 'text-light-200/70 hover:text-light-100'
							}`}
						>
							Monthly
						</button>
						<button
							type='button'
							onClick={() => setInterval('yearly')}
							className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
								interval === 'yearly' ? 'bg-accent text-primary' : 'text-light-200/70 hover:text-light-100'
							}`}
						>
							Yearly
							<span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
								interval === 'yearly' ? 'bg-primary/30 text-primary' : 'bg-accent/15 text-accent'
							}`}>
								Save 17%
							</span>
						</button>
					</div>
				</div>

				{error && (
					<div className='mx-auto mb-6 max-w-xl rounded-xl border border-danger/30 bg-danger/10 p-4 text-center text-danger/80 text-sm'>
						{error}
					</div>
				)}

				<div className='grid gap-5 md:grid-cols-3'>
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
								className={`relative rounded-2xl border p-7 flex flex-col transition-all duration-300 ${
									plan.popular
										? 'border-accent/50 bg-surface-2/90'
										: 'border-white/6 bg-surface-2/60'
								}`}
								style={plan.popular ? { boxShadow: '0 0 40px rgba(99,102,241,0.15), 0 4px 24px rgba(0,0,0,0.4)' } : { boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
							>
								{plan.popular && (
									<div className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary whitespace-nowrap'>
										Most Popular
									</div>
								)}

								<p className='text-xs font-semibold uppercase tracking-widest text-accent/80 mb-2'>{plan.name}</p>
								<div className='flex items-baseline gap-1 mb-1'>
									<span className='text-4xl font-bold text-light-100' style={{ fontFamily: 'Righteous, sans-serif' }}>
										{displayPrice}
									</span>
									{priceSuffix && (
										<span className='text-light-200/50 text-sm'>{priceSuffix}</span>
									)}
								</div>
								<p className='text-light-200/60 text-xs mb-5'>{billingNote}</p>

								<p className='text-light-200/70 text-sm leading-6 mb-5'>{plan.description}</p>

								<ul className='space-y-3 mb-7 flex-1'>
									{plan.features.map((feature) => (
										<li key={feature} className='flex items-start gap-2.5 text-sm text-light-200/80'>
											<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 mt-0.5 text-accent shrink-0' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
												<polyline points='20 6 9 17 4 12'/>
											</svg>
											{feature}
										</li>
									))}
								</ul>

								<button
									type='button'
									onClick={() => handleSubscribe(plan)}
									disabled={isLoading || loadingPlanId !== null}
									className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
										plan.popular
											? 'bg-accent text-primary hover:bg-accent-2'
											: 'bg-white/6 border border-white/10 text-light-100 hover:bg-white/12 hover:border-white/20'
									}`}
									style={plan.popular && !isLoading ? { boxShadow: '0 4px 16px rgba(99,102,241,0.3)' } : {}}
								>
									{isLoading ? 'Redirecting…' : plan.cta}
								</button>
							</article>
						);
					})}
				</div>
			</section>
		</main>
	);
};

export default SubscriptionPage;
