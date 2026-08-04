import datetime
import random

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User
from apps.videos.models import Category, Tag, Video

CATEGORIES = [
    ("Trending Now", "Freshly popular across Desi Hub"),
    ("Latest Uploads", "Newest additions to the platform"),
    ("Comedy", "Laugh-out-loud sketches and stand-up"),
    ("Entertainment", "General entertainment content"),
    ("Short Films", "Independent short-format storytelling"),
    ("Music", "Music videos and performances"),
    ("Vlogs", "Everyday vlogs from creators"),
    ("Web Series", "Original episodic series"),
]

SAMPLE_TITLES = [
    "Chai Pe Charcha", "Dilli Ki Galiyan", "Rangoli Nights", "Bazaar Beats",
    "Monsoon Diaries", "The Startup Chai", "Gully Cricket Chronicles",
    "Sunday Recipes", "Auto Wale Bhaiya", "College Ke Din", "Sapno Ka Safar",
    "Desi Roadtrip", "Mumbai Local Stories", "Wedding Season Chaos",
    "Standup Se Pehle", "Bollywood Rewind", "Cricket Fever", "Ghar Ka Khana",
    "Traffic Talks", "Chhoti Si Duniya",
]

PLACEHOLDER_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"


class Command(BaseCommand):
    help = "Seed Desi Hub with demo categories, users and video metadata."

    def handle(self, *args, **options):
        self.stdout.write("Seeding Desi Hub demo data...")

        if not User.objects.filter(username="himanshu").exists():
            super_admin = User.objects.create_superuser(
                username="himanshu", email="himanshu@desihub.local", password="DesiHub@123",
                role=User.Role.SUPER_ADMIN,
            )
        else:
            super_admin = User.objects.get(username="himanshu")

        if not User.objects.filter(username="content_manager").exists():
            User.objects.create_user(
                username="content_manager", email="cm@desihub.local", password="DesiHub@123",
                role=User.Role.CONTENT_MANAGER,
            )

        if not User.objects.filter(username="demo_user").exists():
            User.objects.create_user(
                username="demo_user", email="user@desihub.local", password="DesiHub@123",
                role=User.Role.USER,
            )

        categories = {}
        for i, (name, desc) in enumerate(CATEGORIES):
            cat, _ = Category.objects.get_or_create(name=name, defaults={"description": desc, "order": i})
            categories[name] = cat

        tag_names = ["popular", "new", "hindi", "family", "hd", "trending"]
        tags = [Tag.objects.get_or_create(name=t)[0] for t in tag_names]

        cat_list = list(categories.values())
        created = 0
        for i, title in enumerate(SAMPLE_TITLES):
            if Video.objects.filter(title=title).exists():
                continue
            video = Video.objects.create(
                title=title,
                description=f"{title} — an original Desi Hub production brought to you by the Desi Hub team.",
                category=random.choice(cat_list),
                language=random.choice(["Hindi", "Hinglish", "English"]),
                release_date=timezone.now().date() - datetime.timedelta(days=random.randint(0, 400)),
                duration_seconds=random.randint(180, 2700),
                content_rating=random.choice(["ALL", "13+", "16+"]),
                status=Video.Status.PUBLISHED,
                visibility=Video.Visibility.PUBLIC,
                created_by=super_admin,
                view_count=random.randint(10, 50000),
                is_featured=(i < 3),
                published_at=timezone.now(),
            )
            for tag in random.sample(tags, k=2):
                video.tags.add(tag)
            created += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done. {created} videos created. Login: himanshu / DesiHub@123 (Super Admin)."
        ))
