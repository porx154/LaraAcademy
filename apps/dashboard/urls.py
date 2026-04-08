from django.urls import path
from . import views

app_name = 'dashboard'#declaras el nombre de la aplicacion para ser invocada
urlpatterns = [
    path('dashboard/', views.dashboard,name='dashboard')
]
