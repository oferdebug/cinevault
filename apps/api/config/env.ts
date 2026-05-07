/// <reference types="node" />

const getRequiredEnv = (name: string): string => {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} is not set`);
	}

	return value;
};

export const env = {
	TMDB_BASE_URL: process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3',
	TMDB_API_KEY: getRequiredEnv('TMDB_API_KEY'),
};

export type Env = typeof env;
