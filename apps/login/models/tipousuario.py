from django.db import models

class TipoUsuario(models.Model):
    cdtipo = models.CharField(max_length=4,unique=True)
    descripcion_tipo = models.CharField(max_length=100)
    fc_crea = models.DateTimeField(auto_now_add=True)
    user_crea = models.CharField(max_length=100)
    fc_modi = models.DateTimeField(auto_now=True)
    user_modi = models.CharField(max_length=100)
    fc_baja = models.DateTimeField(null=True,blank=True)
    
    class Meta:
        ordering = ['-descripcion_tipo']
        
    def __str__(self):
        return self.descripcion_tipo