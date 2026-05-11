import { Link } from 'react-router-dom';

const NotFoundPage = () => {
	return (
		<main className="min-h-screen bg-primary flex flex-col items-center justify-center px-5 relative overflow-hidden">
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99,102,241,0.12), transparent)',
				}}
			/>
			<p className="fancy-text select-none pointer-events-none">404</p>
			<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 -mt-4 relative z-10">
				Page not found
			</p>
			<p className="text-light-200/60 text-sm max-w-sm text-center leading-6 relative z-10">
				We couldn't find what you were looking for. It may have been moved or
				deleted.
			</p>
			<Link to="/" className="btn-ghost mt-7 relative z-10">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<polyline points="15 18 9 12 15 6" />
				</svg>
				Back to Home
			</Link>
		</main>
	);
};

export default NotFoundPage;
