from django.db import models
from django.contrib.auth.models import AbstractUser
from apps.login.models import TipoUsuario
# Create your models here.
class User(AbstractUser):
    #username = None
    email = models.EmailField(unique=True)
    tipousuario = models.ForeignKey(TipoUsuario,on_delete=models.CASCADE)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
