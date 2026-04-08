from django.contrib import admin
from .models import TipoUsuario
# Register your models here.
@admin.register(TipoUsuario)
class TipoUsuarioAdmin(admin.ModelAdmin):
    list_display = ['cdtipo','descripcion_tipo','fc_crea','fc_baja']
    search_fields = ['descripcion_tipo']