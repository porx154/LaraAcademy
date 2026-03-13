from django.db import models
from django.conf import settings
from .tipoempresa import TipoEmpresa
class Empresa(models.Model):
    #null true -> puede almacenar null en base de datos(si no lo pones por defecto es false)
    #blank true -> puede dejar vacio en el formulario(si no lo pones por defecto es false)
    nombre_empresa = models.CharField(unique=True,max_length=100)
    nombre_corto_empresa = models.CharField(max_length=200)
    descripcion_empresa = models.CharField(max_length=500)
    texto_portada = models.CharField(max_length=50)
    descripcion_portada = models.CharField(max_length=200)
    link_facebook = models.CharField(max_length=500,blank=True,null=True)
    link_tiktok = models.CharField(max_length=500,blank=True,null=True)
    link_instagram = models.CharField(max_length=500,blank=True,null=True)
    link_twiter = models.CharField(max_length=500,blank=True,null=True)
    link_comunidad = models.CharField(max_length=500,blank=True,null=True)
    link_otra_comunidad = models.CharField(max_length=500,blank=True,null=True)
    email_corporativo = models.EmailField(max_length=254,unique=True,null=True,blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL,related_name='empresas',on_delete=models.CASCADE)
    tipoempresa = models.ForeignKey(TipoEmpresa,on_delete=models.CASCADE)
    fc_crea = models.DateTimeField(auto_now_add=True)
    user_crea = models.CharField(max_length=100)
    fc_modi = models.DateTimeField(auto_now=True)
    user_modi = models.CharField(max_length=100)
    fc_baja = models.DateTimeField(null=True,blank=True)
    
    class Meta:
        ordering = ['-nombre_empresa']
        
    def __str__(self):
        return self.nombre_empresa