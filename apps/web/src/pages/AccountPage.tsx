import React from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';

interface Subscription {
	id: string;
	plan_id: 'plus' | 'premium';
	billing_interval: 'monthly' | 'yearly';
	status: string;
	current_period_end: string | null;
	cancel_at_period_end: boolean;
}

const AccountPage = () => {
	const [subscription, setSubscription] =
		React.useState<Subscription | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [portalLoading, setPortalLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		const fetchSubscription = async () => {
			try {
				const { data } = await api.get('/billing/me');
				if (data?.ok) {
					setSubscription(data.data.subscription);
				}
			} catch (err) {
				console.error('failed to fetch subscription', err);
				setError('Could not load your subscription.');
			} finally {
				setLoading(false);
			}
		};
		fetchSubscription();
	}, []);

	const openPortal = async () => {
		setPortalLoading(true);
		setError(null);
		try {
			const { data } = await api.post('/billing/portal');
			if (data?.ok && data.data?.url) {
				window.location.href = data.data.url;
				return;
			}
			setError(data?.error?.message ?? 'Could not open billing portal.');
		} catch (err) {
			console.error('portal error', err);
			setError('Failed to open billing portal.');
		} finally {
			setPortalLoading(false);
		}
	};

	const formatDate = (iso: string | null) => {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const planLabel = (planId: string) => {
		if (planId === 'plus') return 'CineVault Plus';
		if (planId === 'premium') return 'CineVault Premium';
		return planId;
	};

	return (
		<main className={'min-h-screen bg-primary px-8 pt-28 pb-20'}>
			<section className={'mx-auto max-w-3xl'}>
				<h1 className={'text-3xl font-bold text-light-100 sm:text-4xl'}>
					Account
				</h1>
				<p className={'mt-2 text-light-200'}>
					Manage your subscription and billing.
				</p>

				{error && (
					<div className={'mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300'}>
						{error}
					</div>
				)}

				<div className={'mt-8 rounded-3xl border border-light-100/10 bg-dark-100/70 p-8'}>
					<h2 className={'text-xl font-bold text-light-100'}>
						Current Plan
					</h2>

					{loading && (
						<p className={'mt-4 text-light-200'}>Loading...</p>
					)}

					{!loading && !subscription && (
						<div className={'mt-4'}>
							<p className={'text-light-200'}>
								You're on the Free plan.
							</p>
							<Link
								to={'/subscribe'}
								className={'mt-6 inline-block rounded-full bg-accent px-6 py-3 font-medium text-primary transition hover:bg-accent/80'}
							>
								Upgrade your plan
							</Link>
						</div>
					)}

					{!loading && subscription && (
						<div className={'mt-4 space-y-4'}>
							<div className={'flex items-center gap-3'}>
								<span className={'text-2xl font-bold text-light-100'}>
									{planLabel(subscription.plan_id)}
								</span>
								<span className={'rounded-full bg-accent/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent'}>
									{subscription.billing_interval}
								</span>
							</div>

							<dl className={'space-y-2 text-sm'}>
								<div className={'flex justify-between'}>
									<dt className={'text-light-200'}>Status</dt>
									<dd className={'font-medium text-light-100 capitalize'}>
										{subscription.status}
									</dd>
								</div>
								<div className={'flex justify-between'}>
									<dt className={'text-light-200'}>
										{subscription.cancel_at_period_end ? 'Ends on' : 'Renews on'}
									</dt>
									<dd className={'font-medium text-light-100'}>
										{formatDate(subscription.current_period_end)}
									</dd>
								</div>
							</dl>

							{subscription.cancel_at_period_end && (
								<div className={'rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300'}>
									Your subscription will end on{' '}
									{formatDate(subscription.current_period_end)}. You'll lose access then.
								</div>
							)}

							<button
								type={'button'}
								onClick={openPortal}
								disabled={portalLoading}
								className={'mt-4 rounded-full bg-accent px-6 py-3 font-medium text-primary transition hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-60'}
							>
								{portalLoading ? 'Opening…' : 'Manage subscription'}
							</button>
						</div>
					)}
				</div>
			</section>
		</main>
	);
};

export default AccountPage;
