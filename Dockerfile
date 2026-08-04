# Repo-root Dockerfile for the Django backend (build context = repo root).
# This exists as a fallback for deploy configurations that build with the
# repository root as context and expect ./Dockerfile there (e.g. a Render
# web service whose "Root Directory"/"Dockerfile Path" dashboard fields
# weren't set to match render.yaml's rootDir:backend + dockerfilePath:
# ./Dockerfile). backend/Dockerfile (context = backend/) remains the
# canonical one used by docker-compose.yml and render.yaml's Blueprint
# config — this file mirrors it exactly, only with paths adjusted for the
# root build context.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN python -m pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN mkdir -p /app/media /app/staticfiles

RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 8000

# entrypoint.sh runs migrations, collectstatic, optional demo seed, then
# execs gunicorn bound to $PORT (defaults to 8000) — same startup sequence
# as backend/Dockerfile, see backend/entrypoint.sh.
ENTRYPOINT ["/app/entrypoint.sh"]
