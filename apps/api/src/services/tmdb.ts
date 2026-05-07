import { env } from '../config/env.js';
export type MediaType = 'movie' | 'tv';

export type TmdbGenre = {
	id: number;
	name: string;
};

const fetchWithTimeout = async (
	url: string,
	timeoutMs = 10_000,
): Promise<Response> => {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		return await fetch(url, { signal: controller.signal });
	} finally {
		clearTimeout(timer);
	}
};

const assertOk = (response: Response, message: string): void => {
	if (!response.ok) {
		throw new Error(`${message}: ${response.status}`);
	}
};

export const getGenres = async (): Promise<TmdbGenre[]> => {
	const movieUrl = `${env.TMDB_BASE_URL}/genre/movie/list?api_key=${env.TMDB_API_KEY}&language=en-US`;
	const tvUrl = `${env.TMDB_BASE_URL}/genre/tv/list?api_key=${env.TMDB_API_KEY}&language=en-US`;

	const [movieResponse, tvResponse] = await Promise.all([
		fetchWithTimeout(movieUrl),
		fetchWithTimeout(tvUrl),
	]);

	assertOk(movieResponse, 'Failed to fetch movie genres from TMDB');
	assertOk(tvResponse, 'Failed to fetch tv genres from TMDB');

	const [movieData, tvData] = await Promise.all([
		movieResponse.json() as Promise<{ genres: TmdbGenre[] }>,
		tvResponse.json() as Promise<{ genres: TmdbGenre[] }>,
	]);

	return [...movieData.genres, ...tvData.genres].filter(
		(genre, index, arr) => arr.findIndex((g) => g.id === genre.id) === index,
	);
};

export const getByGenre = async (
	genreId: number,
	type: MediaType,
): Promise<unknown[]> => {
	const url = `${env.TMDB_BASE_URL}/discover/${type}?api_key=${env.TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US`;

	const response = await fetchWithTimeout(url);
	assertOk(response, `Failed to fetch ${type} titles by genre from TMDB`);

	const data = (await response.json()) as { results: unknown[] };
	return data.results;
};

export const getTitle = async (
	id: number,
	type: MediaType,
): Promise<unknown> => {
	const url = `${env.TMDB_BASE_URL}/${type}/${id}?api_key=${env.TMDB_API_KEY}&append_to_response=credits,videos`;

	const response = await fetchWithTimeout(url);
	assertOk(response, `Failed to fetch ${type} title from TMDB`);

	return response.json();
};

export const searchCatalog = async (query: string): Promise<unknown[]> => {
	const url = `${env.TMDB_BASE_URL}/search/multi?api_key=${env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`;

	const response = await fetchWithTimeout(url);
	assertOk(response, `Failed to search catalog from TMDB: ${query}`);

	const data = (await response.json()) as { results: unknown[] };
	return data.results;
};

export const getSimilar = async (
	id: number,
	type: MediaType,
): Promise<unknown[]> => {
	const url = `${env.TMDB_BASE_URL}/${type}/${id}/similar?api_key=${env.TMDB_API_KEY}&language=en-US`;

	const response = await fetchWithTimeout(url);
	assertOk(response, `Failed to fetch similar titles from TMDB: ${type} ${id}`);

	const data = (await response.json()) as { results: unknown[] };
	return data.results;
};

export const getTrending = async (): Promise<unknown[]> => {
	const url = `${env.TMDB_BASE_URL}/trending/all/week?api_key=${env.TMDB_API_KEY}&language=en-US`;

	const response = await fetchWithTimeout(url);
	assertOk(response, 'Failed to fetch trending titles from TMDB');

	const data = (await response.json()) as { results: unknown[] };
	return data.results;
};
