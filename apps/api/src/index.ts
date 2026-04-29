import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env") });
import express from "express";
import cors from "cors";
import helmet from "helmet";
import pino from "pino";
import catalogRouter from "./routes/catalog.js";

const logger = pino({
	transport: { target: "pino-pretty" },
});

const app = express();

const PORT = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/catalog", catalogRouter);

app.get("/health", (_req, res) => {
	res.json({ ok: true, service: "api", uptime: process.uptime() });
});

app.listen(PORT, () => {
	logger.info(`API listening on http://localhost:${PORT}`);
});
