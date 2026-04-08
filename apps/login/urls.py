from django.urls import path
from . import views

urlpatterns = [
    path("logins/", views.logins, name="logins"),
    path("logout/", views.sesionout, name="logout")
]
