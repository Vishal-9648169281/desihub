import logging
import threading
from pathlib import Path

from django.core.files import File
from django.utils import timezone

from . import ffmpeg_utils
from .models import ProcessingJob, Video, VideoThumbnail

logger = logging.getLogger(__name__)


def queue_video_processing(video_id: int):
    """Fire-and-forget background thread. Swap for a Celery task later
    without changing the calling code in views.py."""
    thread = threading.Thread(target=_process_video, args=(video_id,), daemon=True)
    thread.start()


def _process_video(video_id: int):
    job = ProcessingJob.objects.create(video_id=video_id, job_type="thumbnail_and_metadata")
    job.status = ProcessingJob.JobStatus.RUNNING
    job.started_at = timezone.now()
    job.save(update_fields=["status", "started_at"])

    try:
        video = Video.objects.get(pk=video_id)
        video.status = Video.Status.PROCESSING
        video.save(update_fields=["status"])

        file_path = video.original_file.path
        duration = ffmpeg_utils.probe_duration_seconds(file_path)
        video.duration_seconds = duration

        tmp_dir = Path(file_path).parent / "thumb_tmp"
        selected = None
        for i, pct in enumerate(ffmpeg_utils.THUMBNAIL_POSITIONS):
            out_path = tmp_dir / f"{video.uuid}_{pct}.jpg"
            ok = ffmpeg_utils.extract_thumbnail(file_path, duration or 10, pct, str(out_path))
            if not ok:
                continue
            with open(out_path, "rb") as fh:
                thumb = VideoThumbnail(video=video, position_percent=pct)
                thumb.image.save(f"{video.slug}-{pct}.jpg", File(fh), save=True)
            out_path.unlink(missing_ok=True)
            if selected is None or pct == 25:
                selected = thumb

        if selected:
            selected.is_selected = True
            selected.save(update_fields=["is_selected"])
            video.thumbnail = selected

        video.status = Video.Status.READY
        video.save()

        job.status = ProcessingJob.JobStatus.DONE
        job.message = f"Generated {len(ffmpeg_utils.THUMBNAIL_POSITIONS)} thumbnail candidates."
    except Exception as exc:  # noqa: BLE001
        logger.exception("Video processing failed for video_id=%s", video_id)
        Video.objects.filter(pk=video_id).update(status=Video.Status.FAILED)
        job.status = ProcessingJob.JobStatus.ERROR
        job.message = str(exc)
    finally:
        job.finished_at = timezone.now()
        job.save(update_fields=["status", "message", "finished_at"])
