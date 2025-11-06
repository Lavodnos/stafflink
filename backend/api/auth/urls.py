"""URL patterns for auth endpoints."""

from django.urls import path

from .views import LoginView

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
]
