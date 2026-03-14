from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parents[2]


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "unsafe-dev-secret-key")
DEBUG = False
ALLOWED_HOSTS = [host.strip() for host in os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if host.strip()]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "apps.core",
    "apps.authentication",
    "apps.users",
    "apps.audit",
    "apps.quality",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "apps.core.middleware.TenantContextMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "coldev_cadc_global"),
        "USER": os.getenv("POSTGRES_USER", "postgres"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "postgres"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

TENANT_DATABASE_TEMPLATE = {
    "ENGINE": "django.db.backends.postgresql",
    "USER": os.getenv("TENANT_POSTGRES_USER", os.getenv("POSTGRES_USER", "postgres")),
    "PASSWORD": os.getenv("TENANT_POSTGRES_PASSWORD", os.getenv("POSTGRES_PASSWORD", "postgres")),
    "HOST": os.getenv("TENANT_POSTGRES_HOST", os.getenv("POSTGRES_HOST", "localhost")),
    "PORT": os.getenv("TENANT_POSTGRES_PORT", os.getenv("POSTGRES_PORT", "5432")),
    "CONN_MAX_AGE": int(os.getenv("TENANT_POSTGRES_CONN_MAX_AGE", "60")),
    "OPTIONS": {},
}

TENANT_DATABASE_PREFIX = os.getenv("TENANT_DATABASE_PREFIX", "tenant_")
TENANT_AUTO_REGISTER_DATABASES = env_bool("TENANT_AUTO_REGISTER_DATABASES", True)
TENANT_ENFORCE_DB_READY = env_bool("TENANT_ENFORCE_DB_READY", True)
TENANT_SCOPED_MODEL_LABELS = [
    label.strip()
    for label in os.getenv("TENANT_SCOPED_MODEL_LABELS", "").split(",")
    if label.strip()
]
DATABASE_ROUTERS = ["config.db_router.MultiTenantRouter"]

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = "es-cl"
TIME_ZONE = "America/Santiago"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
