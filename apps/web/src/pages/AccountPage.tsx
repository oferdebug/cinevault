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
		<main className='min-h-screen bg-primary px-5 xs:px-8 pt-8 pb-20'>
			<section className='mx-auto max-w-3xl'>
				<p className='text-xs font-semibold uppercase tracking-widest text-accent mb-2'>Account</p>
				<h1 className='text-left text-4xl sm:text-5xl'>Settings</h1>
				<p className='mt-3 text-light-200/70 text-sm'>
					Manage your subscription and billing.
				</p>

				{error && (
					<div className='mt-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger/80 text-sm'>
						{error}
					</div>
				)}

				<div className='mt-8 glass-card p-7'>
					<p className='text-xs font-semibold uppercase tracking-widest text-accent mb-1'>Subscription</p>
					<h2 className='text-xl font-bold text-light-100 mb-5'>Current Plan</h2>

					{loading && (
						<div className='flex items-center gap-2'>
							<div className='h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin' />
							<p className='text-light-200/60 text-sm'>Loading…</p>
						</div>
					)}

					{!loading && !subscription && (
						<div>
							<p className='text-light-200/70 text-sm mb-5'>You're on the <span className='text-light-100 font-semibold'>Free</span> plan.</p>
							<Link to='/subscribe' className='btn-primary'>
								Upgrade your plan
							</Link>
						</div>
					)}

					{!loading && subscription && (
						<div className='space-y-5'>
							<div className='flex items-center gap-3'>
								<span className='text-2xl font-bold text-light-100'>{planLabel(subscription.plan_id)}</span>
								<span className='rounded-full bg-accent/15 border border-accent/25 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent'>
									{subscription.billing_interval}
								</span>
							</div>

							<dl className='space-y-3 text-sm border-t border-white/5 pt-4'>
								<div className='flex justify-between'>
									<dt className='text-light-200/60'>Status</dt>
									<dd className='font-medium text-success capitalize'>{subscription.status}</dd>
								</div>
								<div className='flex justify-between'>
									<dt className='text-light-200/60'>{subscription.cancel_at_period_end ? 'Ends on' : 'Renews on'}</dt>
									<dd className='font-medium text-light-100'>{formatDate(subscription.current_period_end)}</dd>
								</div>
							</dl>

							{subscription.cancel_at_period_end && (
								<div className='rounded-xl border border-gold/25 bg-gold/10 p-4 text-sm text-gold/90'>
									Your subscription will end on {formatDate(subscription.current_period_end)}. You'll lose access then.
								</div>
							)}

							<button
								type='button'
								onClick={openPortal}
								disabled={portalLoading}
								className='btn-primary disabled:cursor-not-allowed disabled:opacity-60'
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
