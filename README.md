## Database

This project uses Postgres (Vercel Postgres in production, local Postgres in dev).

1. Copy `.env.local.example` to `.env.local` and set `POSTGRES_URL` for your local database.
2. Start the local database, either:
   - Docker: `docker compose up -d`
   - Native Windows install: make sure `blog` database exists.
3. Run pending migrations: `npm run db:migrate`

New schema changes go in a new numbered file under `migrations/` (e.g. `0002_add_something.sql`) and are applied with `npm run db:migrate` — never edit an already-applied migration file.
