import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCardSkeleton from '../components/MovieCardSkeleton';
import api from '../lib/axios';

const fetchGenres = async () => {
	const { data } = await api.get('/catalog/genres');
	return data.data;
};

const fetchByGenre = async (genreId, type) => {
	const { data } = await api.get(`/catalog/by-genre/${genreId}?type=${type}`);
	return data.data;
};

const BrowsePage = () => {
	const [selectedGenre, setSelectedGenre] = useState(null);
	const [mediaType, setMediaType] = useState('movie');
	const navigate = useNavigate();

	const { data: genres } = useQuery({
		queryKey: ['genres'],
		queryFn: fetchGenres,
	});

	const {
		data: movies,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['by-genre', selectedGenre, mediaType],
		queryFn: () => fetchByGenre(selectedGenre, mediaType),
		enabled: !!selectedGenre,
	});

	return (
		<main className="min-h-screen bg-primary pb-20 px-5 xs:px-8">
			<div className="max-w-7xl mx-auto pt-8">
				<div className="mb-8">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
						Browse
					</p>
					<h1 className="text-left text-4xl sm:text-5xl">Discover Titles</h1>
					<p className="mt-3 text-light-200/70 text-sm">
						Pick a genre and explore what's out there.
					</p>
				</div>

				<div className="flex gap-2.5 mb-6">
					{['movie', 'tv'].map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => setMediaType(t)}
							className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
								mediaType === t
									? 'bg-accent text-primary shadow-lg'
									: 'bg-surface-2/80 border border-white/10 text-light-200 hover:border-accent/40 hover:text-light-100'
							}`}
							style={
								mediaType === t
									? { boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }
									: {}
							}
						>
							{t === 'tv' ? 'TV Shows' : 'Movies'}
						</button>
					))}
				</div>

				{genres && (
					<div className="flex flex-wrap gap-2 mb-10">
						{genres.map((genre) => (
							<button
								key={genre.id}
								type="button"
								onClick={() => setSelectedGenre(genre.id)}
								className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 cursor-pointer ${
									selectedGenre === genre.id
										? 'bg-accent text-primary font-semibold'
										: 'bg-surface-2/70 border border-white/8 text-light-200 hover:border-accent/40 hover:text-light-100'
								}`}
							>
								{genre.name}
							</button>
						))}
					</div>
				)}

				{!selectedGenre && (
					<div className="flex flex-col items-center justify-center py-24 gap-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-12 w-12 text-accent/30"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<circle cx="11" cy="11" r="8" />
							<line x1="21" y1="21" x2="16.65" y2="16.65" />
						</svg>
						<p className="text-light-200/50 text-sm">
							Select a genre to browse titles
						</p>
					</div>
				)}

				{isError && (
					<p role="alert" className="text-danger/80 text-center py-10">
						Failed to load titles.
					</p>
				)}

				{isLoading && (
					<div className="all-movies">
						<ul>
							{Array.from({ length: 8 }, (_, i) => `skeleton-${i}`).map(
								(key) => (
									<MovieCardSkeleton key={key} />
								),
							)}
						</ul>
					</div>
				)}

				{movies && movies.length === 0 && !isLoading && (
					<p className="text-light-200/50 text-center py-20 text-sm">
						No titles found for this genre.
					</p>
				)}

				{movies && movies.length > 0 && (
					<div className="all-movies">
						<ul>
							{movies.map((movie) => (
								<li key={movie.id} className="movie-card">
									<button
										type="button"
										className="w-full cursor-pointer text-left"
										onClick={() =>
											navigate(`/title/${movie.id}?type=${mediaType}`)
										}
									>
										<img
											src={
												movie.poster_path
													? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
													: '/src/assets/No-Poster.png'
											}
											alt={movie.title ?? movie.name}
											className="card-poster w-full"
										/>
										<div className="card-inner">
											<h3>{movie.title ?? movie.name}</h3>
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
													<p>{movie.vote_average?.toFixed(1)}</p>
												</div>
												<span>•</span>
												<span className="year">
													{(
														movie.release_date ??
														movie.first_air_date ??
														''
													).slice(0, 4)}
												</span>
											</div>
										</div>
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</main>
	);
};

export default BrowsePage;
