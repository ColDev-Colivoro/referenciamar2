"""
Test settings — SQLite in-memory, no isolated tenant DBs, no audit side-effects.
"""
from .base import *  # noqa: F401, F403

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Use the same DB for everything in tests (no per-tenant databases)
TENANT_ENFORCE_DB_READY = False
TENANT_AUTO_REGISTER_DATABASES = False

# Disable the multi-tenant router so all models land in default
DATABASE_ROUTERS = []

# Speed up password hashing in tests
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# Silence logging noise
LOGGING = {}
