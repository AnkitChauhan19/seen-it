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

## Mobile

```bash
cd mobile
npm install
npm start
```

Optional: set `EXPO_PUBLIC_API_BASE_URL` for a non-localhost backend (Android emulator often needs `http://10.0.2.2:8000`).

## Next steps

1. Create a Supabase project and wire Auth + Postgres.
2. Add TMDB credentials to `backend/.env`.
3. Implement search / media endpoints and connect the Search screen.
