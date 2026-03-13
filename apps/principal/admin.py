from django.contrib import admin
from .models import Empresa,Menu,TipoEmpresa
# Register your models here.
@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ['user__username','nombre_empresa','nombre_corto_empresa','descripcion_empresa','texto_portada','descripcion_portada','fc_crea','fc_baja']
    search_fields = ['nombre_empresa']

@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ['empresa__nombre_empresa','orden','nombre_menu','seccion_menu','titulo_menu','contenido_menu','contenido_link','fc_crea','fc_baja']
    search_fields = ['empresa__nombre_empresa']

@admin.register(TipoEmpresa)
class TipoEmpresaAdmin(admin.ModelAdmin):
    list_display = ['descripcion_tipo','fc_crea','fc_baja']
    search_fields = ['descripcion_tipo']