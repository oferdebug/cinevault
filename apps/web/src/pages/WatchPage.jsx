import { Link } from 'react-router-dom';

const WatchPage = () => {
	return (
		<main className="min-h-screen bg-primary flex flex-col items-center justify-center gap-4">
			<p className="text-light-200 text-lg">Watch functionality coming soon.</p>
			<Link to="/" className="text-sm text-accent hover:underline">
				← Back to Home
			</Link>
		</main>
	);
};

export default WatchPage;
