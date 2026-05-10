import { usePostHog } from '@posthog/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
	const posthog = usePostHog();
	const { vaultItems, removeFromWatchlist, loading } = useWatchlistContext();
	const { ratings } = useUserRatings();
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
		try {
			const { error } = await supabase
				.from('watchlist')
				.delete()
				.eq('id', item.id)
				.eq('user_id', user.id);
			if (error) throw error;

			removeFromWatchlist(item.tmdb_id);

			posthog?.capture('vault_title_removed', {
				tmdb_id: item.tmdb_id,
				media_type: item.media_type,
				title: item.title,
			});
		} catch (error) {
			console.error('Vault remove error:', error);
			toast.error('Failed to remove title from your vault.');
		} finally {
			setRemovingId(null);
		}
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
			<main className="min-h-screen bg-primary px-5 xs:px-8 pt-10 pb-20">
				<div className="mx-auto max-w-6xl flex items-center gap-3">
					<div className="h-5 w-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
					<p className="text-light-200/60 text-sm">Loading your vault…</p>
				</div>
			</main>
		);
	}

	if (!user) {
		return (
			<main className="min-h-screen bg-primary px-5 xs:px-8 pt-10 pb-20 flex items-center justify-center">
				<section className="mx-auto max-w-lg glass-card p-10 text-center">
					<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-7 w-7 text-accent"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
							<path d="M7 11V7a5 5 0 0 1 10 0v4" />
						</svg>
					</div>
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						My Vault
					</p>
					<h2 className="text-2xl font-bold text-light-100">
						Sign in to open your vault.
					</h2>
					<p className="mx-auto mt-3 max-w-sm text-light-200/70 text-sm leading-6">
						Save movies and shows, then come back to your personal CineVault
						anytime.
					</p>
					<button
						type="button"
						onClick={() => navigate('/login')}
						className="btn-primary mt-6"
					>
						Sign In
					</button>
				</section>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-primary px-5 xs:px-8 pt-8 pb-24">
			<section className="mx-auto max-w-6xl">
				<div className="mb-8">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
						My Vault
					</p>
					<h1 className="text-left text-4xl sm:text-5xl">Your saved titles</h1>
					<p className="mt-3 max-w-2xl text-light-200/70 text-sm">
						Everything you saved from CineVault, ready when you are.
					</p>

					{vaultItems.length > 0 && (
						<>
							<div className="mt-8 glass-card p-6 border-accent/15">
								<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
									Your Taste Profile
								</p>
								<p className="text-xl font-semibold text-light-100 leading-7">
									{tasteSummary}
								</p>
							</div>

							<div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
								<div className="stat-card">
									<p className="text-xs text-light-200/60 uppercase tracking-wider mb-1">
										Total Titles
									</p>
									<p className="text-3xl font-bold text-light-100">
										{vaultStats.totalTitles}
									</p>
								</div>
								<div className="stat-card">
									<p className="text-xs text-light-200/60 uppercase tracking-wider mb-1">
										Movies / Series
									</p>
									<p className="text-3xl font-bold text-light-100">
										{vaultStats.movieCount}
										<span className="text-lg text-light-200/40 mx-1">/</span>
										{vaultStats.seriesCount}
									</p>
								</div>
								<div className="stat-card">
									<p className="text-xs text-light-200/60 uppercase tracking-wider mb-1">
										Avg. Rating
									</p>
									<p className="text-3xl font-bold text-gold">
										{vaultStats.averageRating.toFixed(1)}
									</p>
								</div>
								<div className="stat-card border-accent/15">
									<p className="text-xs text-light-200/60 uppercase tracking-wider mb-1">
										Highest Rated
									</p>
									<p className="line-clamp-1 text-base font-semibold text-light-100">
										{vaultStats.highestRated?.title ?? 'None'}
									</p>
									<p className="mt-1 text-sm text-gold flex items-center gap-1">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-3.5 w-3.5"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
										>
											<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
										</svg>
										{Number(vaultStats.highestRated?.vote_average ?? 0).toFixed(
											1,
										)}
									</p>
								</div>
							</div>

							<div className="mt-10 glass-card p-6 border-accent/15">
								<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
									Recommendations
								</p>
								<h2 className="text-xl font-bold text-light-100">
									{recommendationTitle}
								</h2>
								<p className="mt-1 text-light-200/70 text-sm">
									{recommendationDescription}
								</p>

								{mainSeed && (
									<button
										type="button"
										className="btn-secondary mt-4 text-xs px-4 py-2"
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

				{vaultItems.length === 0 ? (
					<div className="glass-card p-10 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-surface-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6 text-light-200/40"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
								<path d="M7 11V7a5 5 0 0 1 10 0v4" />
							</svg>
						</div>
						<h2 className="text-xl font-bold text-light-100">
							Your vault is empty.
						</h2>
						<p className="mt-2 text-light-200/60 text-sm">
							Start saving titles from the home page or title detail pages.
						</p>
						<button
							type="button"
							onClick={() => navigate('/')}
							className="btn-secondary mt-5"
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
											className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-danger/40 bg-danger/15 text-danger backdrop-blur-md transition-all duration-200 hover:bg-danger/30 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
										>
											{removingId === item.id ? (
												<div className="h-3 w-3 rounded-full border border-danger border-t-transparent animate-spin" />
											) : (
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-3.5 w-3.5"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2.5"
													strokeLinecap="round"
													strokeLinejoin="round"
													aria-hidden="true"
												>
													<line x1="18" y1="6" x2="6" y2="18" />
													<line x1="6" y1="6" x2="18" y2="18" />
												</svg>
											)}
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
											<img
												src={posterSrc}
												alt={item.title}
												className="card-poster w-full"
											/>
											<div className="card-inner">
												<h3>{item.title}</h3>
												<div className="content">
													<div className="rating">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-3.5 w-3.5 text-gold"
															viewBox="0 0 24 24"
															fill="currentColor"
															aria-hidden="true"
														>
															<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
														</svg>
														<p>{Number(item.vote_average ?? 0).toFixed(1)}</p>
													</div>
													<span>•</span>
													<span className="lang">
														{item.media_type === 'tv' ? 'Series' : 'Movie'}
													</span>
												</div>
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
