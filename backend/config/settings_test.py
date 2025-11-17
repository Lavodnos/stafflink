"""Settings overrides for running the Django test suite locally without Postgres."""

from .settings import *  # noqa: F401,F403

DATABASES["default"] = {  # type: ignore[name-defined]
    "ENGINE": "django.db.backends.sqlite3",
    "NAME": BASE_DIR / "test.sqlite3",  # type: ignore[name-defined]
}
