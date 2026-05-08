import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { useWatchlistContext } from '../context/WatchlistContext';
import { useUserRating } from '../hooks/useUserRating';
import api from '../lib/axios';
import supabase from '../lib/supabase';

const fetchTitle = async (id, type) => {
	const { data } = await api.get(`/catalog/title/${id}?type=${type}`);
	return data.data;
};

const fetchSimilarTitles = async (id, type) => {
	const { data } = await api.get(`/catalog/similar/${id}?type=${type}`);
	return data.data;
};

const TitleDetailPage = () => {
	const { id } = useParams();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { isInWatchlist, addToWatchlist, removeFromWatchlist } =
		useWatchlistContext();
	const [toggleLoading, setToggleLoading] = useState(false);

	const type = searchParams.get('type') ?? 'movie';

	const {
		data: title,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['title', id, type],
		queryFn: () => fetchTitle(id, type),
	});
	const { data: similarTitlesRaw = [] } = useQuery({
		queryKey: ['similar-titles', id, type],
		queryFn: () => fetchSimilarTitles(id, type),
		enabled: Boolean(id),
	});

	const saved = isInWatchlist(Number(id));
	const {
		rating,
		loading: ratingLoading,
		error: ratingError,
		saveRating,
	} = useUserRating(Number(id), type);

	const handleToggle = async () => {
		if (!user) {
			navigate('/login');
			return;
		}
		if (!title) return;

		const name = title.title ?? title.name;
		setToggleLoading(true);

		try {
			if (saved) {
				const { error } = await supabase
					.from('watchlist')
					.delete()
					.eq('user_id', user.id)
					.eq('tmdb_id', Number(id));
				if (error) throw error;
				removeFromWatchlist(Number(id));
			} else {
				const { error } = await supabase.from('watchlist').insert({
					user_id: user.id,
					tmdb_id: Number(id),
					media_type: type,
					title: name,
					poster_path: title.poster_path,
					vote_average: title.vote_average ?? 0,
				});
				if (error) throw error;
				addToWatchlist({
					tmdb_id: Number(id),
					media_type: type,
					title: name,
					poster_path: title.poster_path,
					vote_average: title.vote_average ?? 0,
				});
			}
		} catch (err) {
			console.error('TitleDetail toggle error:', err);
			if (err?.message?.includes('vault_limit_reached')) {
				alert(
					'Free plan is limited to 20 titles. Upgrade to Plus for unlimited.',
				);
			} else {
				alert('Something went wrong. Please try again.');
			}
		} finally {
			setToggleLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-primary">
				<div className="flex flex-col items-center gap-3">
					<div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
					<p className="text-light-200/60 text-sm">Loading…</p>
				</div>
			</div>
		);
	}

	if (isError || !title) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-primary">
				<p className="text-danger/80 text-sm">Failed to load title.</p>
			</div>
		);
	}

	const trailer = title.videos?.results?.find(
		(v) => v.type === 'Trailer' && v.site === 'YouTube',
	);
	const cast = title.credits?.cast?.slice(0, 8) ?? [];
	const similarTitles = Array.isArray(similarTitlesRaw)
		? similarTitlesRaw
				.filter((item) => item.id !== title.id)
				.slice(0, 8)
				.map((item) => ({ ...item, media_type: type }))
		: [];
	const name = title.title ?? title.name;
	const year = (title.release_date ?? title.first_air_date ?? '').slice(0, 4);
	const backdrop = title.backdrop_path
		? `https://image.tmdb.org/t/p/original${title.backdrop_path}`
		: null;
	const poster = title.poster_path
		? `https://image.tmdb.org/t/p/w500${title.poster_path}`
		: '/src/assets/No-Poster.png';

	return (
		<main className="min-h-screen bg-primary">
			<button
				type="button"
				onClick={() => navigate(-1)}
				aria-label="Go back"
				className="fixed top-24 left-5 xs:left-8 z-20 flex items-center gap-2 text-light-200 bg-surface/80 hover:bg-surface border border-white/8 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer"
				style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
			>
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
				Back
			</button>

			{backdrop && (
				<div className="relative h-[55vh] w-full overflow-hidden">
					<img
						src={backdrop}
						alt={name}
						className="w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-primary/10" />
					<div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent" />
				</div>
			)}

			<div className="max-w-6xl mx-auto px-5 xs:px-8 -mt-36 relative z-10 pb-20">
				<div className="flex gap-6 sm:gap-8 flex-col sm:flex-row">
					<img
						src={poster}
						alt={name}
						className="w-40 sm:w-52 rounded-2xl shadow-2xl shadow-black/60 shrink-0 self-end sm:self-auto"
						style={{
							boxShadow:
								'0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
						}}
					/>

					<div className="flex flex-col justify-end gap-3">
						<h1 className="text-left text-3xl sm:text-5xl leading-tight">
							{name}
						</h1>

						<div className="flex items-center gap-2.5 text-sm text-light-200/70 flex-wrap">
							<span className="flex items-center gap-1 text-gold font-bold text-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
								>
									<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
								</svg>
								{title.vote_average?.toFixed(1)}
							</span>
							<span className="text-white/20">•</span>
							<span>{year}</span>
							<span className="text-white/20">•</span>
							<span className="capitalize">{type}</span>
							{title.runtime && (
								<>
									<span className="text-white/20">•</span>
									<span>{title.runtime} min</span>
								</>
							)}
						</div>

						{title.genres && title.genres.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{title.genres.map((g) => (
									<span
										key={g.id}
										className="px-3 py-1 text-xs rounded-full border border-accent/25 bg-accent/10 text-accent/80"
									>
										{g.name}
									</span>
								))}
							</div>
						)}

						<p className="text-light-200/75 leading-7 max-w-2xl text-sm sm:text-base mt-1">
							{title.overview}
						</p>

						<div className="mt-2 flex flex-wrap gap-3">
							{trailer && (
								<a
									href={`https://www.youtube.com/watch?v=${trailer.key}`}
									target="_blank"
									rel="noopener noreferrer"
									className="btn-primary"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true"
									>
										<polygon points="5 3 19 12 5 21 5 3" />
									</svg>
									Watch Trailer
								</a>
							)}

							<button
								type="button"
								onClick={handleToggle}
								disabled={toggleLoading}
								aria-label={
									saved ? 'Remove from watchlist' : 'Add to watchlist'
								}
								className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-all duration-200 text-sm cursor-pointer disabled:opacity-60 ${
									saved
										? 'bg-success/15 text-success border border-success/30 hover:bg-danger/15 hover:text-danger hover:border-danger/30'
										: 'bg-white/5 text-light-100 border border-white/10 hover:bg-white/10 hover:border-white/20'
								}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill={saved ? 'currentColor' : 'none'}
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
								>
									<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
								</svg>
								{saved ? 'Saved' : 'Add to Vault'}
							</button>
						</div>

						<div className="mt-3">
							<p className="text-xs font-semibold uppercase tracking-widest text-light-200/50 mb-2.5">
								Your Rating
							</p>
							<div className="flex flex-wrap gap-1.5">
								{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
									<button
										key={value}
										type="button"
										onClick={() => saveRating(value)}
										disabled={ratingLoading}
										className={`h-8 w-8 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 ${
											rating === value
												? 'bg-accent text-primary'
												: 'bg-white/8 text-light-200/70 hover:bg-white/15 hover:text-light-100 border border-white/8'
										}`}
									>
										{value}
									</button>
								))}
							</div>
							{ratingError && (
								<p className="text-danger/80 text-xs mt-2">{ratingError}</p>
							)}
						</div>
					</div>
				</div>

				{cast.length > 0 && (
					<section className="mt-14">
						<h2 className="mb-5">Cast</h2>
						<div className="grid grid-cols-4 xs:grid-cols-4 md:grid-cols-8 gap-3">
							{cast.map((person) => (
								<div key={person.id} className="text-center">
									<div className="relative overflow-hidden rounded-xl aspect-square mb-2">
										<img
											src={
												person.profile_path
													? `https://image.tmdb.org/t/p/w185${person.profile_path}`
													: '/src/assets/No-Poster.png'
											}
											alt={person.name}
											className="w-full h-full object-cover"
										/>
									</div>
									<p className="text-xs text-light-100 font-medium line-clamp-1">
										{person.name}
									</p>
									<p className="text-xs text-light-200/50 line-clamp-1">
										{person.character}
									</p>
								</div>
							))}
						</div>
					</section>
				)}

				{similarTitles.length > 0 && (
					<section className="mt-14">
						<h2 className="mb-5">Similar Titles</h2>
						<div className="all-movies">
							<ul>
								{similarTitles.map((item) => (
									<MovieCard
										key={`${item.media_type}-${item.id}`}
										movie={item}
									/>
								))}
							</ul>
						</div>
					</section>
				)}
			</div>
		</main>
	);
};

export default TitleDetailPage;
