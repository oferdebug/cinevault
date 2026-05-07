import { Link } from "react-router-dom";

const NotFoundPage = () => {
	return (
		<main className="min-h-screen bg-primary flex flex-col items-center justify-center gap-4">
			<h1 className="text-6xl font-bold text-accent">404</h1>
			<p className="text-light-200 text-lg">Page not found</p>
			<Link to="/" className="mt-4 text-sm text-accent hover:underline">
				← Back to Home
			</Link>
		</main>
	);
};

export default NotFoundPage;
