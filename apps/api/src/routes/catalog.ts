import { type Response, Router } from 'express';
import pino from 'pino';
import type { MediaType } from '../services/tmdb.js';
import {
	getByGenre,
	getGenres,
	getSimilar,
	getTitle,
	getTrending,
	searchCatalog,
} from '../services/tmdb.js';

const logger = pino(
	process.env.NODE_ENV !== 'production'
		? { transport: { target: 'pino-pretty' } }
		: {},
);

const router = Router();

const isMediaType = (value: unknown): value is MediaType =>
	value === 'movie' || value === 'tv';

const handleTmdbError = (
	err: unknown,
	context: string,
	res: Response,
): void => {
	const isTimeout = err instanceof Error && err.name === 'AbortError';

	logger.error({ err }, context);

	res.status(isTimeout ? 504 : 500).json({
		ok: false,
		error: isTimeout ? 'Request to TMDB timed out' : String(err),
	});
};

router.get('/genres', async (_req, res) => {
	try {
		const data = await getGenres();
		res.json({ ok: true, data });
	} catch (err) {
		handleTmdbError(err, 'genres fetch error', res);
	}
});

router.get('/by-genre/:genreId', async (req, res) => {
	try {
		const { genreId } = req.params;
		const rawType = req.query.type;

		if (!/^\d+$/.test(genreId)) {
			res
				.status(400)
				.json({ ok: false, error: 'Invalid genreId; must be numeric' });
			return;
		}

		if (!isMediaType(rawType)) {
			res
				.status(400)
				.json({ ok: false, error: "Invalid type; must be 'movie' or 'tv'" });
			return;
		}

		const data = await getByGenre(Number(genreId), rawType);
		res.json({ ok: true, data });
	} catch (err) {
		handleTmdbError(err, 'by-genre fetch error', res);
	}
});

router.get('/search', async (req, res) => {
	try {
		const query = req.query.q;

		if (typeof query !== 'string' || !query.trim()) {
			res.status(400).json({ ok: false, error: 'Missing query param: q' });
			return;
		}

		const data = await searchCatalog(query.trim());
		res.json({ ok: true, data });
	} catch (err) {
		handleTmdbError(err, 'search fetch error', res);
	}
});

router.get('/title/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const rawType = req.query.type;

		if (!/^\d+$/.test(id)) {
			res.status(400).json({ ok: false, error: 'Invalid id; must be numeric' });
			return;
		}

		if (!isMediaType(rawType)) {
			res
				.status(400)
				.json({ ok: false, error: "Invalid type; must be 'movie' or 'tv'" });
			return;
		}

		const data = await getTitle(Number(id), rawType);
		res.json({ ok: true, data });
	} catch (err) {
		handleTmdbError(err, 'title fetch error', res);
	}
});

router.get('/similar/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const rawType = req.query.type;

		if (!/^\d+$/.test(id)) {
			res.status(400).json({ ok: false, error: 'Invalid id; must be numeric' });
			return;
		}

		if (!isMediaType(rawType)) {
			res
				.status(400)
				.json({ ok: false, error: "Invalid type; must be 'movie' or 'tv'" });
			return;
		}

		const data = await getSimilar(Number(id), rawType);
		res.json({ ok: true, data });
	} catch (err) {
		handleTmdbError(err, 'similar fetch error', res);
	}
});

router.get('/trending', async (_req, res) => {
	try {
		const data = await getTrending();
		res.json({ ok: true, data });
	} catch (err) {
		handleTmdbError(err, 'trending fetch error', res);
	}
});

export default router;
