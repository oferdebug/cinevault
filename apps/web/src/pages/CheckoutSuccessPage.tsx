import { Link, useSearchParams } from 'react-router-dom';

const CheckoutSuccessPage = () => {
	const [params] = useSearchParams();
	const sessionId = params.get('session_id');

	return (
		<main className={'min-h-screen bg-primary px-8 pt-28 pb-20'}>
			<section className={'mx-auto flex max-w-xl flex-col items-center text-center'}>
				<div className={'flex h-16 w-16 items-center justify-center rounded-full bg-accent/20'}>
					<span className={'text-3xl text-accent'}>✓</span>
				</div>
				<h1 className={'mt-6 text-3xl font-bold text-light-100 sm:text-4xl'}>
					You&apos;re all set.
				</h1>
				<p className={'mt-4 text-light-200'}>
					Your subscription is being activated. It usually takes a few seconds.
				</p>
				<div className={'mt-8 flex gap-3'}>
					<Link to={'/'} className={'rounded-full bg-accent px-6 py-3 font-medium text-primary transition hover:bg-accent/80'}>
						Go to CineVault
					</Link>
					<Link to={'/vault'} className={'rounded-full bg-white/10 px-6 py-3 font-medium text-white transition hover:bg-white/20'}>
						Open My Vault
					</Link>
				</div>
				{sessionId && (
					<p className={'mt-8 text-xs text-light-200/60'}>Reference: {sessionId}</p>
				)}
			</section>
		</main>
	);
};

export default CheckoutSuccessPage;
