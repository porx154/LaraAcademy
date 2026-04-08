from django.urls import path
from . import views
urlpatterns = [
    path("curso-detail", views.curso_detail, name='curso-detail')
]
