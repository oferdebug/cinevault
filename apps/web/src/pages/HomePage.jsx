import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import MovieCardSkeleton from '../components/MovieCardSkeleton';
import UnlockPicker from '../components/UnlockPicker';
import api from '../lib/axios';

const fetchTrending = async () => {
	const { data } = await api.get('/catalog/trending');
	return data.data;
};

const fetchSearch = async (query) => {
	const { data } = await api.get(
		`/catalog/search?q=${encodeURIComponent(query)}`,
	);
	return data.data;
};

const genreFilterMap = {
	Action: [28, 12],
	Drama: [18],
	'Sci-Fi': [878],
};
const quickFilters = [
	'All',
	'Movies',
	'Series',
	'Action',
	'Drama',
	'Sci-Fi',
	'Hidden Gems',
];

export const HomePage = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const [activeFilter, setActiveFilter] = useState('All');

	useEffect(() => {
		const t = setTimeout(() => setDebouncedQuery(searchQuery), 400);
		return () => clearTimeout(t);
	}, [searchQuery]);

	const isSearching = debouncedQuery.trim().length > 1;

	const {
		data: trending,
		isLoading: trendingLoading,
		isError: trendingError,
	} = useQuery({
		queryKey: ['trending'],
		queryFn: fetchTrending,
		enabled: !isSearching,
	});

	const {
		data: searchResults,
		isLoading: searchLoading,
		isError: searchError,
	} = useQuery({
		queryKey: ['search', debouncedQuery],
		queryFn: () => fetchSearch(debouncedQuery),
		enabled: isSearching,
	});

	const movies = isSearching ? searchResults : trending;
	const isLoading = isSearching ? searchLoading : trendingLoading;
	const isError = isSearching ? searchError : trendingError;
	const sectionTitle = isSearching
		? `Results for "${debouncedQuery}"`
		: activeFilter === 'All'
			? 'Trending This Week'
			: `${activeFilter} Titles`;
	const filteredMovies = Array.isArray(movies)
		? movies.filter((movie) => {
			if (activeFilter === 'All') return true;

			if (activeFilter === 'Movies') {
				return (movie.media_type ?? 'movie') === 'movie';
			}

			if (activeFilter === 'Series') {
				return movie.media_type === 'tv';
			}

			if (activeFilter === 'Hidden Gems') {
				return movie.vote_average >= 7 && movie.vote_count < 3000;
			}

			const genreIds = genreFilterMap[activeFilter];

			if (genreIds) {
				return movie.genre_ids?.some((genreId) => genreIds.includes(genreId));
			}

			return true;
		})
		: [];
	return (
		<main className="relative min-h-screen overflow-x-hidden">
			<img
				src="/src/assets/BG.png"
				alt=""
				className="pointer-events-none fixed inset-0 w-full h-full object-cover z-0"
			/>

			<div className="wrapper pt-28 relative z-10">
				<header>
					<h1>
						Stop Scrolling <span className="text-gradient">Tonight</span>
						<br /> Unlock Your Next Watch.
					</h1>
					<p className="mx-auto mt-6 max-w-3xl text-center text-base leading-7 text-light-200">
						Search millions of movies and TV shows. Find your next obsession.
					</p>
				</header>

				<div className="search max-w-2xl mx-auto">
					<div>
						<img src="/src/assets/search-icon-strong-glow.svg" alt="search" />
						<input
							type="text"
							placeholder="Search by title, mood, genre, or vibe..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>

				<UnlockPicker titles={filteredMovies} />

				<section className="mx-auto mt-7 max-w-5xl">
					<div className="flex flex-wrap justify-center gap-3">
						{quickFilters.map((filter) => (
							<button
								key={filter}
								type="button"
								onClick={() => setActiveFilter(filter)}
								className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
									activeFilter === filter
										? 'border-accent bg-accent text-primary'
										: 'border-light-100/10 bg-dark-100/70 text-light-200 hover:border-accent/50 hover:text-light-100'
								}`}
							>
								{filter}
							</button>
						))}
					</div>
				</section>

				<section className="mt-16">
					<h2 className="mb-6">{sectionTitle}</h2>

					{isLoading && (
						<div className="all-movies">
							<ul>
								{[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
									<MovieCardSkeleton key={`skeleton-${n}`} />
								))}
							</ul>
						</div>
					)}

					{isError && (
						<p className="text-red-400 text-center py-10">
							Failed to load movies.
						</p>
					)}

					{!isLoading && !isError && filteredMovies.length === 0 && (
						<p className="py-10 text-center text-light-200">
							No titles found for this filter.
						</p>
					)}

					{filteredMovies.length > 0 && (
						<div className="all-movies">
							<ul>
								{filteredMovies.map((movie) => (
									<MovieCard key={movie.id} movie={movie} />
								))}
							</ul>
						</div>
					)}
				</section>
			</div>
		</main>
	);
};

export default HomePage;