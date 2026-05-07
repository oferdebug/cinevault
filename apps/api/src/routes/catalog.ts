import { Router } from "express";
import pino from "pino";

const logger = pino(
	process.env.NODE_ENV !== "production"
		? { transport: { target: "pino-pretty" } }
		: {},
);

const TMDB_BASE = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.TMDB_API_KEY ?? "";

if (!TMDB_KEY) {
	logger.error("TMDB_API_KEY is not set — exiting");
	process.exit(1);
}

const ALLOWED_MEDIA_TYPES = new Set(["movie", "tv"]);

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

const router = Router();

router.get("/genres", async (_req, res) => {
	try {
		const [moviesRes, tvRes] = await Promise.all([
			fetchWithTimeout(
				`${TMDB_BASE}/genre/movie/list?api_key=${TMDB_KEY}&language=en-US`,
			),
			fetchWithTimeout(
				`${TMDB_BASE}/genre/tv/list?api_key=${TMDB_KEY}&language=en-US`,
			),
		]);

		if (!moviesRes.ok || !tvRes.ok) {
			const status = !moviesRes.ok ? moviesRes.status : tvRes.status;
			res
				.status(502)
				.json({ ok: false, error: "Failed to fetch genres from TMDB", status });
			return;
		}

		const [movies, tv] = (await Promise.all([
			moviesRes.json(),
			tvRes.json(),
		])) as [
			{ genres: { id: number; name: string }[] },
			{ genres: { id: number; name: string }[] },
		];

		const merged = [...(movies.genres ?? []), ...(tv.genres ?? [])].filter(
			(g, i, arr) => arr.findIndex((x) => x.id === g.id) === i,
		);
		res.json({ ok: true, data: merged });
	} catch (err) {
		const isTimeout = err instanceof Error && err.name === "AbortError";
		logger.error({ err }, "genres fetch error");
		res.status(isTimeout ? 504 : 500).json({
			ok: false,
			error: isTimeout ? "Request to TMDB timed out" : String(err),
		});
	}
});

router.get("/by-genre/:genreId", async (req, res) => {
	try {
		const { genreId } = req.params;
		const rawType = req.query.type as string | undefined;

		if (!ALLOWED_MEDIA_TYPES.has(rawType ?? "")) {
			res
				.status(400)
				.json({ ok: false, error: "Invalid type; must be 'movie' or 'tv'" });
			return;
		}
		const type = rawType as string;

		const url = `${TMDB_BASE}/discover/${type}?api_key=${TMDB_KEY}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US`;
		const tmdb = await fetchWithTimeout(url);

		if (!tmdb.ok) {
			res
				.status(502)
				.json({ ok: false, error: "TMDB fetch failed", status: tmdb.status });
			return;
		}

		const data = (await tmdb.json()) as { results: unknown[] };
		res.json({ ok: true, data: data.results });
	} catch (err) {
		const isTimeout = err instanceof Error && err.name === "AbortError";
		logger.error({ err }, "by-genre fetch error");
		res.status(isTimeout ? 504 : 500).json({
			ok: false,
			error: isTimeout ? "Request to TMDB timed out" : String(err),
		});
	}
});

router.get("/search", async (req, res) => {
	try {
		const query = req.query.q as string;
		if (!query) {
			res.status(400).json({ ok: false, error: "Missing query param: q" });
			return;
		}
		const url = `${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=en-US`;
		const tmdb = await fetchWithTimeout(url);

		if (!tmdb.ok) {
			res
				.status(502)
				.json({ ok: false, error: "TMDB fetch failed", status: tmdb.status });
			return;
		}

		const data = (await tmdb.json()) as { results: unknown[] };
		res.json({ ok: true, data: data.results });
	} catch (err) {
		const isTimeout = err instanceof Error && err.name === "AbortError";
		logger.error({ err }, "search fetch error");
		res.status(isTimeout ? 504 : 500).json({
			ok: false,
			error: isTimeout ? "Request to TMDB timed out" : String(err),
		});
	}
});

router.get("/title/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const rawType = req.query.type as string | undefined;

		if (!/^\d+$/.test(id)) {
			res.status(400).json({ ok: false, error: "Invalid id; must be numeric" });
			return;
		}
		if (!ALLOWED_MEDIA_TYPES.has(rawType ?? "")) {
			res
				.status(400)
				.json({ ok: false, error: "Invalid type; must be 'movie' or 'tv'" });
			return;
		}
		const mediaType = rawType as string;

		const url = `${TMDB_BASE}/${mediaType}/${id}?api_key=${TMDB_KEY}&append_to_response=credits,videos`;
		const tmdb = await fetchWithTimeout(url);

		if (!tmdb.ok) {
			res
				.status(502)
				.json({ ok: false, error: "TMDB fetch failed", status: tmdb.status });
			return;
		}

		const data = await tmdb.json();
		res.json({ ok: true, data });
	} catch (err) {
		const isTimeout = err instanceof Error && err.name === "AbortError";
		logger.error({ err }, "title fetch error");
		res.status(isTimeout ? 504 : 500).json({
			ok: false,
			error: isTimeout ? "Request to TMDB timed out" : String(err),
		});
	}
});

router.get("/trending", async (_req, res) => {
	try {
		const url = `${TMDB_BASE}/trending/all/week?api_key=${TMDB_KEY}&language=en-US`;
		const tmdb = await fetchWithTimeout(url);

		if (!tmdb.ok) {
			res
				.status(502)
				.json({ ok: false, error: "TMDB fetch failed", status: tmdb.status });
			return;
		}

		const data = (await tmdb.json()) as { results: unknown[] };
		res.json({ ok: true, data: data.results });
	} catch (err) {
		const isTimeout = err instanceof Error && err.name === "AbortError";
		logger.error({ err }, "trending fetch error");
		res.status(isTimeout ? 504 : 500).json({
			ok: false,
			error: isTimeout ? "Request to TMDB timed out" : String(err),
		});
	}
});

export default router;
