/// <reference types="node" />

const getRequiredEnv = (name: string): string => {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} is not set`);
	}

	return value;
};

const getPort = (): number => {
	const rawPort = process.env.PORT ?? '4000';
	const parsed = Number.parseInt(rawPort, 10);

	if (Number.isNaN(parsed) || parsed <= 0) {
		throw new Error(`PORT must be a positive number, received "${rawPort}"`);
	}

	return parsed;
};

const getCorsOrigins = (): string[] => {
	const rawOrigins = process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN;

	if (!rawOrigins) {
		return ['http://localhost:5173', 'http://localhost:3000'];
	}

	return rawOrigins
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean);
};

export const env = {
	NODE_ENV: process.env.NODE_ENV ?? 'development',
	isDev: (process.env.NODE_ENV ?? 'development') !== 'production',
	PORT: getPort(),
	CORS_ORIGINS: getCorsOrigins(),
	TMDB_BASE_URL: getRequiredEnv('TMDB_BASE_URL'),
	TMDB_API_KEY: getRequiredEnv('TMDB_API_KEY'),
	SUPABASE_URL: getRequiredEnv('SUPABASE_URL'),
	SUPABASE_ANON_KEY: getRequiredEnv('SUPABASE_ANON_KEY'),
};

export type Env = typeof env;
