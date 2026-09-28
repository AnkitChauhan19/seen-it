# SeenIt

Personal Android app for tracking movies, TV, anime, and other screen content.

Stack: React Native (Expo) + FastAPI + Supabase + TMDB. See [PLAN.md](./PLAN.md) for architecture and build order.

## Structure

```text
seen-it/
├── mobile/     # Expo + TypeScript app
├── backend/    # FastAPI service
└── PLAN.md
```

## Backend

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # or: cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Health: [http://localhost:8000/health](http://localhost:8000/health)
- Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

Media (TMDB proxy, key stays on server):

- `GET /api/v1/media/search?q=interstellar&filter=all|movie|tv|anime&page=1`
- `GET /api/v1/media/trending?filter=all|movie|tv|anime`
- `GET /api/v1/media/popular-movies`

Responses are cached in-memory, throttled toward TMDB, and rate-limited per client IP (`slowapi`).

## Mobile

```bash
cd mobile
npm install
npm start
```

Set in `mobile/.env` (see `mobile/.env.example`):

- `EXPO_PUBLIC_API_BASE_URL` — Android emulator often needs `http://10.0.2.2:8000`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable key only; never the secret key)

Run the SQL in `supabase/migrations/001_profiles.sql` in your Supabase project (creates `public.profiles` + auth trigger).

Configure Supabase email redirect URLs for mobile: see [docs/supabase-auth-urls.md](./docs/supabase-auth-urls.md).

## Next steps

1. Run Supabase migrations in `supabase/migrations/`.
2. Set `TMDB_API_KEY` in `backend/.env` and start the API before using Search on device/emulator.
3. Run Supabase migrations `001`–`008` (profiles, media library, theaters, and hardened `delete_own_account`).
