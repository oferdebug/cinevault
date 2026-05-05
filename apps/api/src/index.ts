import { resolve } from 'node:path';
import cors from 'cors';
import { config } from 'dotenv';
import type { ErrorRequestHandler } from 'express';
import express from 'express';
import helmet from 'helmet';
import pino from 'pino';
import billingRouter from './routes/billing.js';
import catalogRouter from './routes/catalog.js';

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino(isDev ? { transport: { target: 'pino-pretty' } } : {});

const rawPort = Number(process.env.PORT);
const PORT = Number.isFinite(rawPort) && rawPort > 0 ? rawPort : 4000;

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
	.split(',')
	.map((o) => o.trim());

const app = express();

app.use(helmet());
app.use(
	cors({
		origin: (origin, cb) => {
			if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
			cb(new Error(`CORS: origin ${origin} not allowed`));
		},
		credentials: true,
	}),
);
app.use(express.json({ limit: '100kb' }));

app.use('/catalog', catalogRouter);
app.use('/billing', billingRouter);

app.get('/health', (_req, res) => {
	res.json({ ok: true, service: 'api', uptime: process.uptime() });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	logger.error({ err }, 'Unhandled error');
	res.status(500).json({
		ok: false,
		error: isDev ? String(err) : 'Internal server error',
	});
};
app.use(errorHandler);

let isShuttingDown = false;
const server = app.listen(PORT, () => {
	logger.info(`API listening on http://localhost:${PORT}`);
});

const gracefulShutdown = (signal: string) => {
	if (isShuttingDown) return;
	isShuttingDown = true;
	logger.info(`${signal} received, shutting down…`);
	server.close((err) => {
		if (err) {
			logger.error({ err }, 'Error during shutdown');
			process.exit(1);
		}
		logger.info('Server closed');
		process.exit(0);
	});
};

config({ path: resolve(process.cwd(), '../../.env') });
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
