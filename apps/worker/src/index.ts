import 'dotenv/config';
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino(
	Object.assign(
		{ name: 'worker' },
		isDev ? { transport: { target: 'pino-pretty' } } : {},
	),
);

logger.info('Worker process started');
logger.info('Waiting for jobs… (queue not yet wired)');

const heartbeat = setInterval(() => {
	logger.debug('worker heartbeat');
}, 30_000);

const shutdown = (signal: string) => {
	logger.info(`${signal} received, shutting down worker…`);
	clearInterval(heartbeat);
	logger.info('Worker shut down');
	process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
