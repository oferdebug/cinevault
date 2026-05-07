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
		<main className="pattern">
			<div className="wrapper pt-28">
				<header className="mx-auto max-w-3xl text-center">
					<p className="text-sm font-bold uppercase tracking-[0.24em] text-accent">
						Search
					</p>
					<h1 className="mt-4">Find your next watch</h1>
					<p className="mx-auto mt-4 max-w-2xl text-light-200">
						Search movies and series by title. Start typing at least 2
						characters.
					</p>
				</header>

				<div className="search mx-auto mt-8 max-w-2xl">
					<div>
						<img src="/src/assets/search-icon-strong-glow.svg" alt="search" />
						<input
							type="text"
							placeholder="Search by title..."
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
					</div>
				</div>

				<section className="mt-12">
					{!canSearch && (
						<p className="py-10 text-center text-light-200">
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
						<p role="alert" className="py-10 text-center text-red-400">
							Failed to load search results.
						</p>
					)}

					{canSearch && !isLoading && !isError && titleResults.length === 0 && (
						<p className="py-10 text-center text-light-200">
							No matching titles found.
						</p>
					)}

					{titleResults.length > 0 && (
						<>
							<h2 className="mb-6 text-left">
								Results for &quot;{debouncedQuery}&quot;
							</h2>
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