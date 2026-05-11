import type { NextFunction, Request, Response } from 'express';
import pino from 'pino';
import { env } from '../config/env.js';

const logger = pino(
	process.env.NODE_ENV !== 'production'
		? { transport: { target: 'pino-pretty' } }
		: {},
);

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

export interface AuthRequest extends Request {
	user: {
		id: string;
		email: string | undefined;
	};
}

export const requireAuth = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const auth = req.headers.authorization;

	if (!auth?.startsWith('Bearer ')) {
		res.status(401).json({
			ok: false,
			error: { message: 'Missing or malformed Authorization header' },
		});
		return;
	}

	const token = auth.slice('Bearer '.length).trim();

	if (!token) {
		res.status(401).json({ ok: false, error: { message: 'Empty token' } });
		return;
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 5000);
	try {
		const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
			headers: {
				apikey: SUPABASE_ANON_KEY,
				Authorization: `Bearer ${token}`,
			},
			signal: controller.signal,
		});
		if (!r.ok) {
			logger.warn({ status: r.status }, 'supabase rejected token');
			res
				.status(401)
				.json({ ok: false, error: { message: 'Invalid or expired token' } });
			return;
		}

		const user = (await r.json()) as { id: string; email?: string };

		(req as AuthRequest).user = {
			id: user.id,
			email: user.email,
		};
		next();
	} catch (err) {
		const isTimeout = err instanceof Error && err.name === 'AbortError';
		logger.error({ err }, 'auth middleware error');
		res.status(isTimeout ? 504 : 500).json({
			ok: false,
			error: {
				message: isTimeout ? 'Auth check timed out' : 'Auth check failed',
			},
		});
	} finally {
		clearTimeout(timer);
	}
};
