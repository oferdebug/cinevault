import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWatchlistContext } from '../context/WatchlistContext';
import supabase from '../lib/supabase';
import { getVaultStats } from '../utils/getVaultStats';
const VaultPage = () => {
	const navigate = useNavigate();
	const { user, loading: authLoading } = useAuth();
	const { vaultItems, removeFromWatchlist, refresh, loading } =
		useWatchlistContext();
	const [error, setError] = useState('');
	const [removingId, setRemovingId] = useState(null);

	const vaultStats = getVaultStats(vaultItems);
	const { averageRating, movieCount, seriesCount } = vaultStats;

	const tasteLevel =
		averageRating >= 7.5
			? 'You have high standards'
			: 'You enjoy casual content';

	const preference =
		movieCount > seriesCount
			? 'You prefer movies'
			: movieCount < seriesCount
				? 'You prefer series'
				: 'You enjoy both equally';

	const behavior =
		seriesCount > movieCount
			? 'You binge series'
			: movieCount > seriesCount
				? 'You lean toward movies'
				: 'Balanced watching habits';
	const handleRemove = async (item) => {
		setRemovingId(item.id);
		setError('');

		removeFromWatchlist(item.tmdb_id);

		const { error: deleteError } = await supabase
			.from('watchlist')
			.delete()
			.eq('id', item.id)
			.eq('user_id', user.id);

		if (deleteError) {
			setError('Failed to remove title from your vault.');
			void refresh();
		}

		setRemovingId(null);
	};

	if (authLoading || loading) {
		return (
			<main className="min-h-screen bg-primary px-8 pt-28 pb-20">
				<div className="mx-auto max-w-6xl">
					<p className="text-light-200">Loading your vault…</p>
				</div>
			</main>
		);
	}

	if (!user) {
		return (
			<main className="min-h-screen bg-primary px-8 pt-28 pb-20">
				<section className="mx-auto max-w-3xl rounded-3xl border border-light-100/10 bg-dark-100/70 p-8 text-center">
					<p className="text-sm font-bold uppercase tracking-[0.24em] text-accent">
						My Vault
					</p>
					<h1 className="mt-4 text-4xl font-bold text-light-100">
						Sign in to open your vault.
					</h1>
					<p className="mx-auto mt-4 max-w-xl text-light-200">
						Save movies and shows, then come back to your personal CineVault
						anytime.
					</p>
					<button
						type="button"
						onClick={() => navigate('/login')}
						className="mt-6 rounded-full bg-accent px-7 py-3 text-sm font-bold text-primary transition hover:bg-accent/80"
					>
						Sign In
					</button>
				</section>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-primary px-8 pt-28 pb-20">
			<section className="mx-auto max-w-6xl">
				<div className="mb-8">
					<p className="mt-2 text-2xl font-bold text-light-100">
						{movieCount > seriesCount && averageRating >= 7.5
							? 'Your vault leans toward movies, with a preference for highly rated titles.'
							: movieCount > seriesCount
								? 'Your vault leans toward movies, with a taste for lighter, more casual titles.'
								: seriesCount > movieCount && averageRating >= 7.5
									? 'Your vault leans toward series, with a strong preference for high-quality titles.'
									: seriesCount > movieCount
										? 'Your vault leans toward series, with a preference for more casual titles.'
										: averageRating >= 7.5
											? 'You watch a balanced mix of movies and series, with a strong preference for high-quality content.'
											: 'You watch a balanced mix of movies and series, with a preference for casual content.'}
					</p>
					<div className="mt-8">
						<p className="text-sm text-light-200">Your Taste Profile</p>
						<p className="mt-2 text-xl font-bold text-light-100">
							{tasteLevel}
						</p>
						<p className="mt-1 text-light-200">{preference}</p>
						<p className="mt-1 text-light-200">{behavior}</p>
					</div>
					{vaultItems.length > 0 && (
						<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<div className="rounded-2xl border border-light-100/10 bg-dark-100/70 p-5">
								<p className="text-sm text-light-200">Total Titles</p>
								<p className="mt-2 text-3xl font-bold text-light-100">
									{vaultStats.totalTitles}
								</p>
							</div>

							<div className="rounded-2xl border border-light-100/10 bg-dark-100/70 p-5">
								<p className="text-sm text-light-200">Movies vs Series</p>
								<p className="mt-2 text-3xl font-bold text-light-100">
									{vaultStats.movieCount} / {vaultStats.seriesCount}
								</p>
							</div>

							<div className="rounded-2xl border border-light-100/10 bg-dark-100/70 p-5">
								<p className="text-sm text-light-200">
									You tend to watch above-average content
								</p>
								<p className="mt-2 text-3xl font-bold text-light-100">
									{vaultStats.averageRating.toFixed(1)}
								</p>
							</div>

							<div className="rounded-2xl border border-accent/20 bg-dark-100/70 p-5">
								<p className="text-sm text-light-200">Highest Rated</p>
								<p className="mt-2 line-clamp-1 text-xl font-bold text-light-100">
									{vaultStats.highestRated?.title ?? 'None'}
								</p>
								<p className="mt-1 text-sm text-accent">
									⭐{' '}
									{Number(vaultStats.highestRated?.vote_average ?? 0).toFixed(
										1,
									)}
								</p>
							</div>
						</div>
					)}
				</div>

				{error && <p className="mb-6 text-red-400">{error}</p>}

				{vaultItems.length === 0 ? (
					<div className="rounded-3xl border border-light-100/10 bg-dark-100/70 p-8 text-center">
						<h2 className="text-2xl font-bold text-light-100">
							Your vault is empty.
						</h2>
						<p className="mt-3 text-light-200">
							Start saving titles from the home page or title detail pages.
						</p>
						<button
							type="button"
							onClick={() => navigate('/')}
							className="mt-6 rounded-full border border-accent/40 px-6 py-3 text-sm font-bold text-accent transition hover:bg-accent hover:text-primary"
						>
							Discover Titles
						</button>
					</div>
				) : (
					<div className="all-movies">
						<ul>
							{vaultItems.map((item) => {
								const posterSrc = item.poster_path
									? `https://image.tmdb.org/t/p/w500${item.poster_path}`
									: '/src/assets/No-Poster.png';

								return (
									<li
										key={item.id ?? item.tmdb_id}
										className="movie-card relative"
									>
										<button
											type="button"
											aria-label="Remove from vault"
											disabled={removingId === item.id}
											onClick={() => handleRemove(item)}
											className="absolute right-7 top-7 z-10 rounded-full border border-accent bg-accent px-3 py-1.5 text-xs font-bold text-primary backdrop-blur-md transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{removingId === item.id ? 'Removing…' : 'Remove'}
										</button>

										<button
											type="button"
											className="w-full cursor-pointer text-left"
											onClick={() =>
												navigate(
													`/title/${item.tmdb_id}?type=${item.media_type ?? 'movie'}`,
												)
											}
										>
											<img src={posterSrc} alt={item.title} />
											<h3>{item.title}</h3>
											<div className="content">
												<div className="rating">
													<span>⭐</span>
													<p>{Number(item.vote_average ?? 0).toFixed(1)}</p>
												</div>
												<span>•</span>
												<span className="lang">
													{item.media_type === 'tv' ? 'Series' : 'Movie'}
												</span>
											</div>
										</button>
									</li>
								);
							})}
						</ul>
					</div>
				)}
			</section>
		</main>
	);
};

export default VaultPage;
