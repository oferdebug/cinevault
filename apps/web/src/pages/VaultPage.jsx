import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { useWatchlistContext } from '../context/WatchlistContext';
import { useUserRatings } from '../hooks/useUserRatings';
import api from '../lib/axios';
import supabase from '../lib/supabase';
import { getRecommendationSeeds } from '../utils/getRecommendationSeeds';
import { getVaultStats } from '../utils/getVaultStats';

const VaultPage = () => {
	const navigate = useNavigate();
	const { user, loading: authLoading } = useAuth();
	const { vaultItems, removeFromWatchlist, refresh, loading } =
		useWatchlistContext();
	const { ratings } = useUserRatings();
	const [error, setError] = useState('');
	const [removingId, setRemovingId] = useState(null);
	const [recommendations, setRecommendations] = useState([]);

	const vaultStats = useMemo(() => getVaultStats(vaultItems), [vaultItems]);

	const enrichedItems = useMemo(() => {
		return vaultItems.map((item) => {
			const userRating = ratings.find(
				(rating) =>
					item.tmdb_id === rating.tmdb_id &&
					item.media_type === rating.media_type,
			);

			return {
				...item,
				userRating: userRating?.rating ?? null,
			};
		});
	}, [vaultItems, ratings]);
	const seedItems = useMemo(
		() => getRecommendationSeeds(enrichedItems, vaultStats),
		[enrichedItems, vaultStats],
	);

	const mainSeed = seedItems[0];
	const seedTitle = mainSeed?.title ?? mainSeed?.name;
	const { averageRating, movieCount, seriesCount } = vaultStats;

	const tasteSummary =
		movieCount > seriesCount && averageRating >= 7.5
			? 'Your vault leans toward movies, with a preference for highly rated titles.'
			: movieCount > seriesCount
				? 'Your vault leans toward movies, with a taste for lighter, more casual titles.'
				: seriesCount > movieCount && averageRating >= 7.5
					? 'Your vault leans toward series, with a strong preference for high-quality titles.'
					: seriesCount > movieCount
						? 'Your vault leans toward series, with a preference for more casual titles.'
						: averageRating >= 7.5
							? 'You watch a balanced mix of movies and series, with a strong preference for high-quality content.'
							: 'You watch a balanced mix of movies and series, with a preference for casual content.';

	const recommendationTitle = seedTitle
		? `Because you liked ${seedTitle}`
		: 'Recommendations for you';

	const recommendationDescription = seedTitle
		? `Here are picks similar to ${seedTitle}.`
		: 'Here are movie and series picks that match your vault behavior.';

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

	useEffect(() => {
		if (!seedItems.length) {
			setRecommendations([]);
			return;
		}

		let ignore = false;

		const fetchRecommendations = async () => {
			try {
				const responses = await Promise.all(
					seedItems.map((seed) =>
						api.get(
							`/catalog/similar/${seed.tmdb_id}?type=${seed.media_type ?? 'movie'}`,
						),
					),
				);

				if (ignore) return;

				const merged = responses.flatMap((response, index) => {
					const seed = seedItems[index];

					return (response.data.data ?? []).map((item) => ({
						...item,
						media_type: seed.media_type ?? 'movie',
					}));
				});

				const uniqueRecommendations = merged.filter(
					(movie, index, array) =>
						array.findIndex(
							(item) =>
								item.id === movie.id && item.media_type === movie.media_type,
						) === index,
				);

				setRecommendations(uniqueRecommendations.slice(0, 6));
			} catch (err) {
				console.error('Failed to fetch recommendations', err);
				setRecommendations([]);
			}
		};

		fetchRecommendations();

		return () => {
			ignore = true;
		};
	}, [seedItems]);

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
					<p className="text-sm font-bold uppercase tracking-[0.24em] text-accent">
						My Vault
					</p>

					<h1 className="-ml-2 mt-3 text-left text-4xl font-bold text-light-100">
						Your saved titles
					</h1>

					<p className="mt-3 max-w-2xl text-light-200">
						Everything you saved from CineVault, ready when you are.
					</p>

					{vaultItems.length > 0 && (
						<>
							<div className="mt-8 rounded-3xl border border-accent/20 bg-dark-100/70 p-6">
								<p className="text-xs uppercase tracking-widest text-accent">
									Your Taste Profile
								</p>

								<p className="mt-3 text-2xl font-bold text-light-100">
									{tasteSummary}
								</p>
							</div>

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
									<p className="text-sm text-light-200">Average Rating</p>
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

							<div className="mt-12 rounded-3xl border border-accent/20 bg-dark-100/70 p-6">
								<p className="text-xs uppercase tracking-widest text-accent">
									Recommendations
								</p>

								<h2 className="mt-3 text-2xl font-bold text-light-100">
									{recommendationTitle}
								</h2>

								<p className="mt-2 text-light-200">
									{recommendationDescription}
								</p>

								{mainSeed && (
									<button
										type="button"
										className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-bold text-primary transition hover:bg-accent/80"
										onClick={() =>
											navigate(
												`/title/${mainSeed.tmdb_id}?type=${mainSeed.media_type ?? 'movie'}`,
											)
										}
									>
										View Similar Titles
									</button>
								)}

								{recommendations.length > 0 && (
									<div className="mt-6 all-movies">
										<ul>
											{recommendations.map((movie) => (
												<MovieCard
													key={`${movie.media_type}-${movie.id}`}
													movie={movie}
												/>
											))}
										</ul>
									</div>
								)}
							</div>
						</>
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
