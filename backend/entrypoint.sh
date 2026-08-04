#!/bin/sh
set -e

echo "Waiting for database..."
python - <<'PYEOF'
import os
import time
import psycopg2

for _ in range(30):
    try:
        psycopg2.connect(
            dbname=os.environ.get("POSTGRES_DB", "desihub"),
            user=os.environ.get("POSTGRES_USER", "desihub"),
            password=os.environ.get("POSTGRES_PASSWORD", "desihub"),
            host=os.environ.get("POSTGRES_HOST", "db"),
            port=os.environ.get("POSTGRES_PORT", "5432"),
        ).close()
        break
    except Exception:
        time.sleep(1)
else:
    raise SystemExit("Database not reachable")
PYEOF

python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ "$SEED_DEMO_DATA" = "True" ]; then
    python manage.py seed_demo_data || true
fi

exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}" --workers 3 --timeout 120
