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
		<main className="relative min-h-screen overflow-x-hidden bg-primary">
			<div
				className="pointer-events-none fixed inset-0 z-0"
				style={{
					background:
						'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(99,102,241,0.20) 0%, transparent 70%), radial-gradient(ellipse 50% 35% at 85% 15%, rgba(129,140,248,0.10) 0%, transparent 60%)',
				}}
			/>

			<div className="wrapper pt-12 relative z-10">
				<header className="mt-0">
					<p className="mx-auto mb-4 w-fit rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
						Discover &amp; Watch
					</p>
					<h1>
						Stop Scrolling{' '}
						<span className="text-gradient">Tonight</span>
						<br />
						Unlock Your Next Watch.
					</h1>
					<p className="mx-auto mt-5 max-w-2xl text-center text-base leading-7 text-light-200/80">
						Search millions of movies and TV shows. Find your next obsession.
					</p>
				</header>

				<div className="search max-w-2xl mx-auto">
					<div>
						<svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 h-5 w-5 text-accent/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
						</svg>
						<input
							type="text"
							placeholder="Search by title, mood, genre, or vibe..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>

				<UnlockPicker titles={filteredMovies} />

				<section className="mx-auto mt-8 max-w-5xl">
					<div className="flex flex-wrap justify-center gap-2.5">
						{quickFilters.map((filter) => (
							<button
								key={filter}
								type="button"
								onClick={() => setActiveFilter(filter)}
								className={`pill-filter ${activeFilter === filter ? 'active' : ''}`}
							>
								{filter}
							</button>
						))}
					</div>
				</section>

				<section className="mt-14">
					<div className="flex items-baseline gap-3 mb-6">
						<h2 className="mb-0">{sectionTitle}</h2>
						{!isLoading && filteredMovies.length > 0 && (
							<span className="text-sm text-gray-100">{filteredMovies.length} titles</span>
						)}
					</div>

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
						<p className="text-danger/80 text-center py-10">
							Failed to load movies. Please try again.
						</p>
					)}

					{!isLoading && !isError && filteredMovies.length === 0 && (
						<p className="py-10 text-center text-light-200/60">
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