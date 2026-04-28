import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import pino from "pino";

const logger = pino({
	transport: { target: "pino-pretty" },
});

const app = express();

const PORT = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ ok: true, service: "api", uptime: process.uptime() });
});

app.listen(PORT, () => {
	logger.info(`API listening on http://localhost:${PORT}`);
});
