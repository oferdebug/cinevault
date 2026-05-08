# CineVault

CineVault is a modern streaming-style web application for movies and TV shows.

The project is structured as a monorepo with separate applications for the web client, API server, background worker, and shared code.

## Project Structure

```txt
cinevault/
├── apps/
│   ├── web/       # React + Vite frontend
│   ├── api/       # Express API server
│   └── worker/    # Background jobs / queue worker
├── packages/
│   └── shared/    # Shared types, schemas, and utilities
├── package.json
└── pnpm-workspace.yaml
```

## Tech Stack

### Web

- React
- Vite
- Tailwind CSS
- React Router
- TanStack Query

### API

- Node.js
- Express
- Helmet
- CORS
- Pino logger
- Zod validation

### Worker

- BullMQ
- Redis
- TypeScript

### Shared Package

- Shared schemas
- Shared types
- Reusable utilities

## Requirements

- Node.js 20 or newer
- pnpm 10 or newer

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the web app:

```bash
pnpm dev:web
```

Run the API server:

```bash
pnpm dev:api
```

Run the worker:

```bash
pnpm dev:worker
```

Build all apps:

```bash
pnpm build
```

Lint all apps:

```bash
pnpm lint
```

## Current Status

CineVault currently includes the base monorepo setup, frontend routing, an Express API health endpoint, a worker package, and a shared package foundation.

The next development focus should be:

1. Fix missing frontend dependencies.
2. Define the core data model for movies, series, users, watchlists, and subscriptions.
3. Connect the web app to the API.
4. Add authentication.
5. Add real content data and search/browse flows.

## API Health Check

When the API is running, check:

```bash
http://localhost:4000/health
```

Expected response:

```json
{
  "ok": true,
  "service": "api",
  "uptime": 123
}
```

## Development Notes

This project is still early-stage. Keep changes small, structured, and easy to review.

Prefer building one stable feature at a time instead of adding many unfinished screens or systems.
