from django.shortcuts import render,get_object_or_404
from django.contrib.auth.decorators import login_required
from django.conf import settings
from apps.cursos.models import AsignacionCurso
from django.contrib.auth import get_user_model
# Create your views here.
@login_required
def dashboard(request):
    print(request.user.first_name)
    email = request.user
    pasword = request.user.password
    cursos = obtener_cursos_usuario(email,pasword)
    for mis_cursos in cursos:
        print(mis_cursos.curso.descripcion_curso)
    return render(request,'dashboard/dashboard.html',{
        'cursos':cursos
    })

def obtener_cursos_usuario(email,pasword):
    if email and pasword:
        #filtramos el alumno que queremos por email y password ya logeados
        user = get_object_or_404(get_user_model(),email=email,password=pasword)
        #filtramos para obtener la lista de cursos en la tabla AsignacionCurso
        asignaciones = AsignacionCurso.objects.filter(user=user)
        return asignaciones        
    else:
        return None