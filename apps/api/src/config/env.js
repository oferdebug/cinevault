const tmdbBase = process.env.TMDB_BASE_URL ?? process.env.VITE_TMDB_BASE_URL;
const tmdbKey = process.env.TMDB_API_KEY ?? process.env.VITE_TMDB_API_KEY;
if (!tmdbBase || !tmdbKey) {
    const missing = [];
    if (!tmdbBase)
        missing.push('TMDB_BASE_URL');
    if (!tmdbKey)
        missing.push('TMDB_API_KEY');
    throw new Error(`Missing required TMDB env vars: ${missing.join(', ')}`);
}
export const TMDB_BASE = tmdbBase;
export const TMDB_KEY = tmdbKey;
//# sourceMappingURL=env.js.map