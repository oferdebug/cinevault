import { usePostHog } from '@posthog/react';
import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const CheckoutSuccessPage = () => {
	const [params] = useSearchParams();
	const sessionId = params.get('session_id');
	const posthog = usePostHog();
	const fired = useRef(false);

	useEffect(() => {
		if (fired.current) return;
		if (!sessionId || !posthog) return;
		fired.current = true;
		posthog.capture('checkout_completed', {
			session_id: sessionId,
		});
	}, [posthog, sessionId]);

	return (
		<main className="min-h-screen bg-primary flex items-center justify-center px-5 xs:px-8 py-12 relative overflow-hidden">
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(34,197,94,0.12), transparent)',
				}}
			/>
			<section className="glass-card mx-auto flex max-w-lg flex-col items-center text-center p-10 relative z-10">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-success/30 bg-success/15 mb-6">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-8 w-8 text-success"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<polyline points="20 6 9 17 4 12" />
					</svg>
				</div>
				<p className="text-xs font-semibold uppercase tracking-widest text-success mb-2">
					Success
				</p>
				<h1 className="text-3xl font-bold text-light-100 sm:text-4xl">
					You&apos;re all set.
				</h1>
				<p className="mt-3 text-light-200/70 text-sm leading-6">
					Your subscription is being activated. It usually takes a few seconds.
				</p>
				<div className="mt-8 flex flex-wrap gap-3 justify-center">
					<Link to="/" className="btn-primary">
						Go to CineVault
					</Link>
					<Link to="/vault" className="btn-ghost">
						Open My Vault
					</Link>
				</div>
				{sessionId && (
					<p className="mt-8 text-xs text-light-200/40">
						Reference: {sessionId}
					</p>
				)}
			</section>
		</main>
	);
};

export default CheckoutSuccessPage;
