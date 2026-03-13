from django.shortcuts import render,get_object_or_404,redirect
from .models import Empresa,Menu
from apps.cursos.models import Curso,AsignacionCurso
from django.core.mail import send_mail

# Create your views here.
def inicio(request):
    empresa = get_object_or_404(Empresa,nombre_empresa='Lara',fc_baja__isnull=True)
    if empresa:
        menu = Menu.objects.filter(empresa=empresa).order_by('orden')
        cursos = Curso.objects.filter(empresa=empresa)
        asignacion = AsignacionCurso.objects.select_related('user','curso')
        
    if request.method == 'POST' and empresa:
        enviar_correo_inicio(request.POST['nombre_remite'],request.POST['email_remite'],request.POST['contenido_remite'],empresa.email_corporativo)
    return render(request,'principal/inicio.html',{
        'datos_empresa': empresa,
        'menu': menu,
        'cursos':cursos,
        'asignacion': asignacion
    })

def enviar_correo_inicio(nombre_remite,email_remite,contenido_remite,correo_destino):
    send_mail(f'Correos desde la pagina WEB : {nombre_remite}',
              contenido_remite,
              email_remite,
              [correo_destino],
              fail_silently=False
              )