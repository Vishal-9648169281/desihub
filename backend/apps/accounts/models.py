import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN = "SUPER_ADMIN", "Super Admin"
        CONTENT_MANAGER = "CONTENT_MANAGER", "Content Manager"
        USER = "USER", "User"

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    @property
    def is_content_staff(self):
        return self.role in (self.Role.SUPER_ADMIN, self.Role.CONTENT_MANAGER) or self.is_superuser

    @property
    def is_super_admin(self):
        return self.role == self.Role.SUPER_ADMIN or self.is_superuser

    def __str__(self):
        return self.username


class TeamMember(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="team_profile")
    title = models.CharField(max_length=120, blank=True)
    bio = models.TextField(blank=True)
    can_publish = models.BooleanField(default=False)
    added_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="team_members_added"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.title})"
