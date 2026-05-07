import cors from 'cors';
import type { ErrorRequestHandler } from 'express';
import express from 'express';
import helmet from 'helmet';
import pino from 'pino';

import { env } from './config/env.js';
import billingRouter from './routes/billing.js';
import catalogRouter from './routes/catalog.js';

const logger = pino(env.isDev ? { transport: { target: 'pino-pretty' } } : {});

const app = express();

app.use(helmet());

app.use(
cors({
origin: (origin, cb) => {
if (!origin || env.CORS_ORIGINS.includes(origin)) {
return cb(null, true);
}

cb(new Error(`CORS: origin ${origin} not allowed`));
},
credentials: true,
}),
);

app.use(
'/billing/webhook',
express.raw({ type: 'application/json' }),
billingRouter,
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
error: env.isDev ? String(err) : 'Internal server error',
});
};

app.use(errorHandler);

let isShuttingDown = false;

const server = app.listen(env.PORT, () => {
logger.info(`API listening on http://localhost:${env.PORT}`);
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

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
