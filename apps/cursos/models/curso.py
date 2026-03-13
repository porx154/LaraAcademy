from django.db import models
from django.conf import settings
from apps.principal.models import Empresa
class Curso(models.Model):
    titulo_curso = models.CharField(max_length=100)
    descripcion_curso = models.CharField(max_length=500)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    link_portada = models.CharField(max_length=500,null=True,blank=True)
    #user = models.ForeignKey(settings.AUTH_USER_MODEL,related_name='cursos',on_delete=models.CASCADE)
    asignacion = models.ManyToManyField(settings.AUTH_USER_MODEL,through='AsignacionCurso',related_name='cursos')
    empresa = models.ForeignKey(Empresa,on_delete=models.CASCADE)
    cdmodal = models.CharField(max_length=100,null=True,blank=True)
    objetivo_curso = models.CharField(max_length=500,null=True,blank=True)
    fc_crea = models.DateTimeField(auto_now_add=True)
    user_crea = models.CharField(max_length=100)
    fc_modi = models.DateTimeField(auto_now=True)
    user_modi = models.CharField(max_length=100)
    fc_baja = models.DateTimeField(null=True,blank=True)
    
    class Meta:
        ordering = ['-fecha_inicio']
    
    def __str__(self):
        return self.titulo_curso
    
class AsignacionCurso(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    curso = models.ForeignKey(Curso,on_delete=models.CASCADE)
    fc_crea = models.DateTimeField(auto_now_add=True)
    user_crea = models.CharField(max_length=100)
    fc_modi = models.DateTimeField(auto_now=True)
    user_modi = models.CharField(max_length=100)
    fc_baja = models.DateTimeField(null=True,blank=True)
    
    class Meta:
        unique_together = ('user','curso')
    
    def __str__(self):
        return f"{self.user} - {self.curso}"