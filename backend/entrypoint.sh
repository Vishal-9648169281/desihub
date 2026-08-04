#!/bin/sh
set -e

echo "DATABASE_URL configured: $([ -n "$DATABASE_URL" ] && echo yes || echo no)"

# On Render (detected via RENDER_EXTERNAL_HOSTNAME, already relied on in settings.py
# for ALLOWED_HOSTS) there is no local Postgres to fall back to — if DATABASE_URL is
# missing there, retrying against localhost for 30 attempts just wastes a minute
# before failing anyway. Fail fast with a clear message instead. Local development
# (no RENDER_EXTERNAL_HOSTNAME) keeps using the POSTGRES_*/localhost fallback.
if [ -z "$DATABASE_URL" ] && [ -n "$RENDER_EXTERNAL_HOSTNAME" ]; then
    echo "ERROR: DATABASE_URL is not configured. Set it in Render -> desihub-backend -> Environment."
    exit 1
fi

echo "Waiting for database..."
python <<'PY'
import os
import time

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.conf import settings
from django.db import connections
from django.db.utils import OperationalError

print("Database engine:", settings.DATABASES["default"]["ENGINE"])

MAX_ATTEMPTS = 30
for attempt in range(1, MAX_ATTEMPTS + 1):
    try:
        connections["default"].ensure_connection()
        print("Database connected.")
        break
    except OperationalError:
        print(f"Database not reachable ({attempt}/{MAX_ATTEMPTS}), retrying...")
        time.sleep(2)
else:
    print("Database connection failed.")
    raise SystemExit(1)
PY

echo "Running migrations..."
python manage.py migrate --noinput
echo "Migrations complete."

echo "Collecting static files..."
python manage.py collectstatic --noinput
echo "Static files collected."

if [ "$SEED_DEMO_DATA" = "True" ]; then
    echo "Seeding demo data..."
    python manage.py seed_demo_data || true
fi

echo "Starting Gunicorn on port ${PORT:-8000} with ${WEB_CONCURRENCY:-3} worker(s)..."
exec gunicorn config.wsgi:application \
    --bind "0.0.0.0:${PORT:-8000}" \
    --workers "${WEB_CONCURRENCY:-3}" \
    --timeout 120
