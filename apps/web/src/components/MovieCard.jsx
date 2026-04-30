import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../hooks/useWatchlist';

const MovieCard = ({ movie }) => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { saved, loading, toggle } = useWatchlist(movie.id);

	const title = movie.title ?? movie.name;
	const year = (movie.release_date ?? movie.first_air_date ?? '').slice(0, 4);
	const mediaType = movie.media_type ?? 'movie';
	const posterSrc = movie.poster_path
		? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
		: '/src/assets/No-Poster.png';

	const handleVaultClick = (event) => {
		event.stopPropagation();

		if (!user) {
			navigate('/login');
			return;
		}

		toggle({
			media_type: mediaType,
			title,
			poster_path: movie.poster_path,
			vote_average: movie.vote_average ?? 0,
		});
	};

	return (
		<li className="movie-card relative">
			<button
				type="button"
				aria-label={saved ? 'Remove from vault' : 'Add to vault'}
				disabled={loading}
				onClick={handleVaultClick}
				className={`absolute right-7 top-7 z-10 rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur-md transition ${
					saved
						? 'border-accent bg-accent text-primary'
						: 'border-light-100/20 bg-primary/70 text-light-100 hover:border-accent hover:text-accent'
				}`}
			>
				{saved ? '✓ In Vault' : '+ Vault'}
			</button>

			<button
				type="button"
				className="w-full cursor-pointer text-left"
				onClick={() => navigate(`/title/${movie.id}?type=${mediaType}`)}
			>
				<img src={posterSrc} alt={title} />

				<h3>{title}</h3>

				<div className="content">
					<div className="rating">
						<span>⭐</span>
						<p>{movie.vote_average?.toFixed(1)}</p>
					</div>

					<span>•</span>

					<span className="year">{year}</span>

					<span>•</span>

					<span className="lang">{movie.original_language}</span>
				</div>
			</button>
		</li>
	);
};

export default MovieCard;
