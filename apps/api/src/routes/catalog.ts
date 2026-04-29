import { Router } from "express";

const router = Router();

router.get("/search", async (req, res) => {
  try {
    const TMDB_BASE = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
    const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ ok: false, error: "Missing query param: q" });
      return;
    }
    const url = `${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=en-US`;
    const tmdb = await fetch(url);
    const data = await tmdb.json() as { results: unknown[] };
    res.json({ ok: true, data: data.results });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

router.get("/title/:id", async (req, res) => {
  try {
    const TMDB_BASE = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
    const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
    const { id } = req.params;
    const mediaType = req.query.type ?? "movie";
    const url = `${TMDB_BASE}/${mediaType}/${id}?api_key=${TMDB_KEY}&append_to_response=credits,videos`;
    const tmdb = await fetch(url);
    const data = await tmdb.json();
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

router.get("/trending", async (_req, res) => {
  try {
    const TMDB_BASE = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
    const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
    const url = `${TMDB_BASE}/trending/all/week?api_key=${TMDB_KEY}&language=en-US`;
    const tmdb = await fetch(url);
    const data = await tmdb.json() as { results: unknown[] };
    res.json({ ok: true, data: data.results });
  } catch (err) {
    console.error("TMDB fetch error:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;