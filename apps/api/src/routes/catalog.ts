import { Router } from "express";

const router = Router();

router.get("/trending", async (_req, res) => {
  try {
    const TMDB_BASE = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
    const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
    const url = `${TMDB_BASE}/trending/all/week?api_key=${TMDB_KEY}&language=en-US`;
    console.log("Fetching TMDB:", url);
    const tmdb = await fetch(url);
    console.log("TMDB status:", tmdb.status);
    const data = await tmdb.json() as { results: unknown[]; status_message?: string };
    console.log("TMDB data keys:", Object.keys(data));
    res.json({ ok: true, data: data.results ?? data });
  } catch (err) {
    console.error("TMDB fetch error:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;