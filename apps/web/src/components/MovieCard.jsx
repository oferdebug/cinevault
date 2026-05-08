import { usePostHog } from '@posthog/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useWatchlistContext } from '../context/WatchlistContext';
import supabase from '../lib/supabase';

const IconBookmark = ({ filled }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-4 w-4"
		viewBox="0 0 24 24"
		fill={filled ? 'currentColor' : 'none'}
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
	</svg>
);

const IconStar = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-3.5 w-3.5 text-gold"
		viewBox="0 0 24 24"
		fill="currentColor"
		aria-hidden="true"
	>
		<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
	</svg>
);

const MovieCard = ({ movie }) => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { isInWatchlist, removeFromWatchlist, addToWatchlist } =
		useWatchlistContext();
	const [loading, setLoading] = useState(false);
	const posthog = usePostHog();

	const saved = isInWatchlist(movie.id);
	const title = movie.title ?? movie.name;
	const year = (movie.release_date ?? movie.first_air_date ?? '').slice(0, 4);
	const mediaType = movie.media_type ?? 'movie';
	const posterSrc = movie.poster_path
		? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
		: '/src/assets/No-Poster.png';

	const handleVaultClick = async (event) => {
		event.stopPropagation();
		if (!user) {
			navigate('/login');
			return;
		}
		setLoading(true);
		try {
			if (saved) {
				const { error } = await supabase
					.from('watchlist')
					.delete()
					.eq('user_id', user.id)
					.eq('tmdb_id', movie.id);
				if (error) throw error;
				removeFromWatchlist(movie.id);
			} else {
				const { error } = await supabase.from('watchlist').insert({
					user_id: user.id,
					tmdb_id: movie.id,
					media_type: mediaType,
					title,
					poster_path: movie.poster_path,
					vote_average: movie.vote_average ?? 0,
				});
				if (error) throw error;
				addToWatchlist({
					tmdb_id: movie.id,
					media_type: mediaType,
					title,
					poster_path: movie.poster_path,
					vote_average: movie.vote_average ?? 0,
				});
			}
			posthog?.capture('vault_toggle', {
				tmdb_id: movie.id,
				media_type: mediaType,
				saved: !saved,
				user_id: user.id,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			console.error('Vault toggle error:', error);
			if (error?.message?.includes('vault_limit_reached')) {
				toast.error('Vault full', {
					description:
						'Free plan is limited to 20 titles. Upgrade to Plus for unlimited access.',
					action: {
						label: 'Upgrade',
						onClick: () => navigate('/subscribe'),
					},
				});
			} else {
				toast.error('Something went wrong. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<li className="movie-card relative">
			<button
				type="button"
				aria-label={saved ? 'Remove from vault' : 'Add to vault'}
				disabled={loading}
				onClick={handleVaultClick}
				className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 cursor-pointer disabled:opacity-50 ${
					saved
						? 'border-accent bg-accent text-primary'
						: 'border-white/20 bg-black/50 text-white/70 hover:border-accent/60 hover:text-accent'
				}`}
			>
				<IconBookmark filled={saved} />
			</button>

			<button
				type="button"
				className="w-full cursor-pointer text-left"
				onClick={() => navigate(`/title/${movie.id}?type=${mediaType}`)}
			>
				<img src={posterSrc} alt={title} className="card-poster w-full" />
				<div className="card-inner">
					<h3>{title}</h3>
					<div className="content">
						<div className="rating">
							<IconStar />
							<p>{movie.vote_average?.toFixed(1)}</p>
						</div>
						<span>•</span>
						<span className="year">{year}</span>
						<span>•</span>
						<span className="lang">{movie.original_language}</span>
					</div>
				</div>
			</button>
		</li>
	);
};

export default MovieCard;
