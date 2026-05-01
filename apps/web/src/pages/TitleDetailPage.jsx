import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { useWatchlistContext } from '../context/WatchlistContext';
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
				removeFromWatchlist(Number(id));
				await supabase
					.from('watchlist')
					.delete()
					.eq('user_id', user.id)
					.eq('tmdb_id', Number(id));
			} else {
				addToWatchlist({
					tmdb_id: Number(id),
					media_type: type,
					title: name,
					poster_path: title.poster_path,
					vote_average: title.vote_average ?? 0,
				});
				await supabase.from('watchlist').insert({
					user_id: user.id,
					tmdb_id: Number(id),
					media_type: type,
					title: name,
					poster_path: title.poster_path,
					vote_average: title.vote_average ?? 0,
				});
			}
		} catch (err) {
			console.error('TitleDetail toggle error:', err);
		} finally {
			setToggleLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-gray-100 text-lg">Loading…</p>
			</div>
		);
	}

	if (isError || !title) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-red-400 text-lg">Failed to load title.</p>
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
				className="fixed top-24 left-8 z-20 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm transition-colors"
			>
				← Back
			</button>

			{backdrop && (
				<div className="relative h-[60vh] w-full overflow-hidden">
					<img
						src={backdrop}
						alt={name}
						className="w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-linear-to-t from-primary via-primary/60 to-transparent" />
				</div>
			)}

			<div className="max-w-6xl mx-auto px-8 -mt-32 relative z-10 pb-16">
				<div className="flex gap-8 flex-col sm:flex-row">
					<img
						src={poster}
						alt={name}
						className="w-48 rounded-2xl shadow-2xl shadow-black/50 shrink-0"
					/>

					<div className="flex flex-col justify-end">
						<h1 className="text-left text-4xl sm:text-5xl mb-3">{name}</h1>

						<div className="flex items-center gap-3 text-sm text-gray-100 mb-4 flex-wrap">
							<span className="text-accent font-bold text-base">
								⭐ {title.vote_average?.toFixed(1)}
							</span>
							<span>•</span>
							<span>{year}</span>
							<span>•</span>
							<span className="capitalize">{type}</span>
							{title.runtime && (
								<>
									<span>•</span>
									<span>{title.runtime} min</span>
								</>
							)}
						</div>

						<p className="text-light-200 leading-7 max-w-2xl">
							{title.overview}
						</p>

						<div className="mt-6 flex flex-wrap gap-3">
							{trailer && (
								<a
									href={`https://www.youtube.com/watch?v=${trailer.key}`}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 bg-accent text-primary font-semibold px-6 py-3 rounded-full hover:bg-accent/80 transition-colors"
								>
									▶ Watch Trailer
								</a>
							)}

							<button
								type="button"
								onClick={handleToggle}
								disabled={toggleLoading}
								aria-label={
									saved ? 'Remove from watchlist' : 'Add to watchlist'
								}
								className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-colors ${
									saved
										? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
										: 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
								}`}
							>
								{saved ? '✓ Saved' : '+ Watchlist'}
							</button>
						</div>
					</div>
				</div>

				{cast.length > 0 && (
					<section className="mt-12">
						<h2 className="mb-6">Cast</h2>
						<div className="grid grid-cols-2 xs:grid-cols-4 md:grid-cols-8 gap-4">
							{cast.map((person) => (
								<div key={person.id} className="text-center">
									<img
										src={
											person.profile_path
												? `https://image.tmdb.org/t/p/w185${person.profile_path}`
												: '/src/assets/No-Poster.png'
										}
										alt={person.name}
										className="w-full aspect-square object-cover rounded-xl mb-2"
									/>
									<p className="text-xs text-light-100 font-medium line-clamp-1">
										{person.name}
									</p>
									<p className="text-xs text-gray-100 line-clamp-1">
										{person.character}
									</p>
								</div>
							))}
						</div>
					</section>
				)}

				{similarTitles.length > 0 && (
					<section className="mt-14">
						<h2 className="mb-6 text-left">Similar Titles</h2>
						<div className="all-movies">
							<ul>
								{similarTitles.map((item) => (
									<MovieCard key={`${item.media_type}-${item.id}`} movie={item} />
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
