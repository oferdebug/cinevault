// biome-ignore lint/correctness/noUnusedImports: React is required for this TSX runtime setup.
import React from 'react';

const plans = [
	{
		name: 'Free',
		price: '$0.00',
		description: 'Start building your personal vault.',
		features: [
			'Up to 20 saved titles',
			'Basic recommendations',
			'Basic insights',
		],
		cta: 'Get Started',
	},
	{
		name: 'Plus',
		price: '$7.99',
		description: 'For people who want smarter discovery.',
		features: [
			'Unlimited Vault',
			'Smart recommendations',
			'User ratings',
			'Advanced insights',
			'Continue Watching',
		],
		cta: 'Upgrade to Plus',
		featured: true,
		popular: true,
	},
	{
		name: 'Premium',
		price: '$12.99',
		description: 'For households and power users.',
		features: [
			'Everything in Plus',
			'Family profiles',
			'Priority recommendations',
			'Early access features',
		],
		cta: 'Choose Premium',
	},
];
const SubscriptionPage = () => {
	return (
		<main className={'min-h-screen bg-primary px-8 pt-28 pb-20'}>
			<section className={'mx-auto max-w-8xl'}>
				<div className={'text-center'}>
					<p
						className={
							'text-sm font-bold uppercase tracking-[0.26em] text-accent'
						}
					>
						CineVault Plans
					</p>
					<h1 className={'mt-4 text-4xl font-bold text-light-200 sm:text-5xl'}>
						Choose the plan that&apos;s right for you. And start saving your
						favorite titles.
					</h1>
					<p className={'mx-auto my-4 max-w-2xl text-light-200'}>
						Start free, then unlock smarter recommendations, unlimited vault
						space, and advanced taste insights.
					</p>
				</div>
				<div className={'mt-12 grid gap-6 md:grid-cols-3'}>
					{plans.map((plan) => (
						<article
							key={plan.name}
							className={`rounded-3xl border p-6 ${plan.featured ? 'border-accent bg-dark-100/90' : 'border-light-100/10 bg-dark-100/70'}`}
						>
							<p className={'text-xl font-bold text-light-100'}>{plan.name}</p>
							<p className={'mt-4 text-4xl font-bold text-light-100'}>
								{plan.price}
							</p>
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
								className={`mt-6 btn-primary ${plan.featured ? 'bg-accent text-primary hover:bg-accent/80' : 'bg-white/10 text-white hover:bg-white/20'}`}
							>
								{plan.cta}
							</button>
							<p className={'mt-6 text-sm text-light-200'}>
								Billed {plan.price} monthly. Cancel anytime.
							</p>
						</article>
					))}
				</div>
			</section>
		</main>
	);
};

export default SubscriptionPage;
