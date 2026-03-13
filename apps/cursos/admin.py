from django.contrib import admin
from .models import Curso,AsignacionCurso
# Register your models here.
@admin.register(Curso)
class CursoAdmin(admin.ModelAdmin):
    list_display = ['titulo_curso','descripcion_curso','fecha_inicio','fecha_fin','fc_crea','fc_baja']
    search_fields = ['titulo_curso']
    
@admin.register(AsignacionCurso)
class AsignacionCursoAdmin(admin.ModelAdmin):
    list_display = ['user__first_name','user','curso']
    search_fields = ['curso__titulo_curso']