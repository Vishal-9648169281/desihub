# Desi Hub

An original OTT-style video streaming platform. Django REST Framework backend, React + Vite + TypeScript + Tailwind frontend, PostgreSQL, FFmpeg-based thumbnail generation.

## Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, React Router
- **Backend**: Django 5, Django REST Framework, SimpleJWT
- **Database**: PostgreSQL 16 (full-text search via `django.contrib.postgres`)
- **Media processing**: FFmpeg, run in a background thread per upload (swap for Celery+Redis later without changing the calling code — see `backend/apps/videos/processing.py`)
- **Deploy**: Docker Compose (nginx serving the built frontend + reverse-proxying `/api`, `/admin`, `/media`, `/static` to Django+Gunicorn)

## Quick start — Docker (recommended for deploy)

1. Copy the env file and fill in real secrets:
   ```bash
   cp .env.example .env
   ```
   At minimum change `DJANGO_SECRET_KEY` and `POSTGRES_PASSWORD`. Set `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to your real domain.

2. Build and start everything:
   ```bash
   docker compose up -d --build
   ```

3. Create the superuser / seed demo data (first run only):
   ```bash
   docker compose exec backend python manage.py createsuperuser
   # or, for demo content:
   docker compose exec backend python manage.py seed_demo_data
   ```

4. Visit `http://localhost` (or your server's IP/domain). Django admin is at `/admin/`.

Uploaded videos, generated thumbnails and the Postgres data all live in named Docker volumes, so `docker compose down` (without `-v`) keeps your data.

### One-shot demo seed on first boot

Set `SEED_DEMO_DATA=True` in `.env` and the backend container will run `seed_demo_data` automatically after migrating. Demo login: **himanshu / DesiHub@123** (Super Admin).

## Local development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
./venv/Scripts/activate        # Windows
pip install -r requirements.txt
# Postgres must be running locally and match the DB vars in ../.env (or export them)
python manage.py migrate
python manage.py seed_demo_data   # optional demo content
python manage.py runserver 0.0.0.0:8000
```

Requires `ffmpeg`/`ffprobe` on PATH for thumbnail generation to work.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

`frontend/.env.development` points the dev server at `http://localhost:8000/api`. Adjust if your backend runs elsewhere.

## Roles

- **SUPER_ADMIN** — full access: manage users/team, all video CRUD, publish/unpublish, categories, analytics.
- **CONTENT_MANAGER** — upload/edit videos, manage metadata, publish if granted.
- **USER** — browse, search, watch, favorite, maintain history. Cannot upload — enforced server-side in every admin endpoint (`apps/accounts/permissions.py`), not just hidden in the UI.

Promote a user to Content Manager from **Admin Dashboard → Team** (Super Admin only), or via `/admin/` → Users.

## What's implemented vs. simplified for this first cut

Implemented: JWT auth + roles, full video CRUD, categories/tags, PostgreSQL full-text search with suggestions, favorites, watch history, resume/continue-watching, trending score (recency-weighted, not lifetime views), category-based recommendations, admin dashboard with stats, search analytics (top + zero-result queries), FFmpeg thumbnail generation (4 candidate frames, selectable, custom upload override) run in a background thread so uploads don't block, custom video player (seek/volume/speed/PiP/fullscreen/keyboard shortcuts), mobile-first responsive UI with bottom tab bar.

Simplified for a same-day deploy (documented so it's easy to pick back up):
- **Streaming**: original file is served directly (progressive MP4), not HLS. `VideoAsset`/quality-rendition models exist in the schema; wire up FFmpeg HLS segmenting (`ffmpeg -f hls ...`) into `apps/videos/processing.py` next.
- **Background jobs**: a plain Python thread, not Celery+Redis. `processing.py` is the single place to swap `threading.Thread` for a Celery task — the calling code (`views.py`) doesn't need to change.
- **Storage**: local disk (Docker volume). Swap `DEFAULT_FILE_STORAGE`/`MEDIA` settings for an S3-compatible backend (e.g. `django-storages`) when ready for CDN delivery — nothing in the app hard-codes local paths outside settings.
- **Search**: Postgres full-text search (`SearchVector`/`SearchRank`), not Elasticsearch. The `SearchView` is the only place that would need to change.

## Project layout

```
desi-hub/ (this repo, at himansu/)
  backend/        Django + DRF project
    apps/accounts/     User, roles, JWT auth
    apps/videos/       Video, Category, Tag, thumbnails, ffmpeg processing, trending/recommendations
    apps/engagement/   WatchHistory, WatchProgress, Favorite, VideoView, SearchHistory
  frontend/       React + Vite + TS + Tailwind
  docker/         nginx.conf (reverse proxy + static/media serving)
  docker-compose.yml
  .env.example
```
