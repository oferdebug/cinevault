import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import MovieCard from '../components/MovieCard';
import MovieCardSkeleton from '../components/MovieCardSkeleton';
import api from '../lib/axios';

const fetchSearch = async (query) => {
	const { data } = await api.get(
		`/catalog/search?q=${encodeURIComponent(query)}`,
	);
	return data.data;
};

const SearchPage = () => {
	const [query, setQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query.trim());
		}, 400);

		return () => clearTimeout(timer);
	}, [query]);

	const canSearch = debouncedQuery.length > 1;

	const {
		data: results,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['search-page', debouncedQuery],
		queryFn: () => fetchSearch(debouncedQuery),
		enabled: canSearch,
	});

	const titleResults = useMemo(
		() =>
			Array.isArray(results)
				? results.filter(
						(item) => item.media_type === 'movie' || item.media_type === 'tv',
					)
				: [],
		[results],
	);

	return (
		<main className="min-h-screen bg-primary">
			<div className="wrapper pt-8">
				<header className="mx-auto max-w-3xl text-center mt-0">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						Search
					</p>
					<h1 className="mt-0">Find your next watch</h1>
					<p className="mx-auto mt-4 max-w-2xl text-light-200/70 text-sm">
						Search movies and series by title.
					</p>
				</header>

				<div className="search mx-auto mt-6 max-w-2xl">
					<div>
						<svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 h-5 w-5 text-accent/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
						</svg>
						<input
							type="text"
							placeholder="Search by title..."
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
					</div>
				</div>

				<section className="mt-10">
					{!canSearch && (
						<p className="py-10 text-center text-light-200/50 text-sm">
							Type at least 2 characters to search.
						</p>
					)}

					{canSearch && isLoading && (
						<div className="all-movies">
							<ul>
								{[1, 2, 3, 4, 5, 6].map((index) => (
									<MovieCardSkeleton key={`search-skeleton-${index}`} />
								))}
							</ul>
						</div>
					)}

					{canSearch && isError && (
						<p role="alert" className="py-10 text-center text-danger/80 text-sm">
							Failed to load search results.
						</p>
					)}

					{canSearch && !isLoading && !isError && titleResults.length === 0 && (
						<p className="py-10 text-center text-light-200/50 text-sm">
							No matching titles found.
						</p>
					)}

					{titleResults.length > 0 && (
						<>
							<div className="flex items-baseline gap-3 mb-6">
								<h2 className="mb-0">Results for &quot;{debouncedQuery}&quot;</h2>
								<span className="text-sm text-gray-100">{titleResults.length} titles</span>
							</div>
							<div className="all-movies">
								<ul>
									{titleResults.map((movie) => (
										<MovieCard key={`${movie.media_type}-${movie.id}`} movie={movie} />
									))}
								</ul>
							</div>
						</>
					)}
				</section>
			</div>
		</main>
	);
};

export default SearchPage;