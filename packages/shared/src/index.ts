/**
 * Shared types and utilities for the CineVault monorepo.
 *
 * This package contains:
 * - Type definitions used across multiple apps
 * - Utility functions for common operations
 * - Zod schemas for validation
 * - Constants and configuration
 */

import { z } from "zod";

export const UserSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	displayName: z.string(),
	role: z.enum(["user", "admin"]),
	createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Title
 * Movie Or Tv Show Type
 **/

export const TitleTypeSchema = z.enum(["MOVIE", "TV"]);
export type TitleType = z.infer<typeof TitleTypeSchema>;

export const TitleSchema = z.object({
	id: z.string(),
	tmdbId: z.number().int(),
	type: TitleTypeSchema,
	title: z.string(),
	overview: z.string().nullable(),
	posterUrl: z.string().url().nullable(),
	backdropUrl: z.string().url().nullable(),
	releaseDate: z.string().nullable(),
	runtimeMinutes: z.number().int().nullable(),
	genres: z.array(z.string()),
});

export type Title = z.infer<typeof TitleSchema>;

/**
 * API Response Types
 *
 *
 *
 * */

export interface ApiSuccess<T> {
	ok: true;
	data: T;
}

export interface ApiError {
	ok: false;
	error: {
		message: string;
		code?: string;
	};
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
