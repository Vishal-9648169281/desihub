"""FFmpeg helpers for metadata extraction and thumbnail generation.

Run inside a background thread by the upload view so the HTTP request
returns immediately (see views.trigger_processing). This keeps the async
"do not block the upload request" requirement without needing a full
Celery/Redis deployment for the first production cut.
"""

import json
import logging
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)

THUMBNAIL_POSITIONS = [10, 25, 50, 75]


def probe_duration_seconds(file_path: str) -> int:
    try:
        result = subprocess.run(
            [
                "ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "json", file_path,
            ],
            capture_output=True, text=True, timeout=60, check=True,
        )
        data = json.loads(result.stdout)
        return int(float(data["format"]["duration"]))
    except Exception:
        logger.exception("ffprobe failed for %s", file_path)
        return 0


def extract_thumbnail(file_path: str, duration_seconds: int, percent: int, out_path: str) -> bool:
    timestamp = max(0.5, duration_seconds * percent / 100)
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    try:
        subprocess.run(
            [
                "ffmpeg", "-y", "-ss", str(timestamp), "-i", file_path,
                "-frames:v", "1", "-q:v", "2", "-vf", "scale=640:-1", out_path,
            ],
            capture_output=True, timeout=60, check=True,
        )
        return Path(out_path).exists()
    except Exception:
        logger.exception("ffmpeg thumbnail extraction failed for %s @ %s%%", file_path, percent)
        return False
