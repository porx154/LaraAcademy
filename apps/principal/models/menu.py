from django.db import models
from .empresa import Empresa

class Menu(models.Model):
    nombre_menu = models.CharField(max_length=100,unique=True)
    seccion_menu = models.CharField(max_length=100)
    titulo_menu = models.CharField(max_length=100)
    contenido_menu = models.CharField(max_length=500,null=True,blank=True)
    contenido_link = models.CharField(max_length=200, null=True,blank=True)
    orden = models.PositiveSmallIntegerField()
    fc_crea = models.DateTimeField(auto_now_add=True)
    user_crea = models.CharField(max_length=100)
    fc_modi = models.DateTimeField(auto_now=True)
    user_modi = models.CharField(max_length=100)
    fc_baja = models.DateTimeField(null=True,blank=True)
    empresa = models.ForeignKey(Empresa,related_name='menus',on_delete=models.CASCADE)
    
    class Meta:
        ordering = ['-orden']
    
    def __str__(self):
        return super().__str__()