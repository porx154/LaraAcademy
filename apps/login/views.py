from django.shortcuts import render,redirect
from django.contrib.auth import login as auth_login,logout,authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
# Create your views here.
def logins(request):
    template = 'login/login.html'
    if request.method == 'POST':
       email = request.POST.get('username')
       password = request.POST.get('password')
       print(f"{email} - {password}")
       user = authenticate(request, username=email, password=password)
       if user:
           if user.tipousuario.cdtipo == 'A':
               auth_login(request,user)
               return redirect('dashboard:dashboard')
           else:
               return login_render(request,template,'Usuario ono tienes permisos')
       else:
           return login_render(request,template,'Usuario y/o password incorrectos.')
           
    return login_render(request,template)
    
def login_render(request,template,msg=''):
    return render(request,template,{
        'mensaje':msg
    })


def sesionout(request):
    logout(request)
    return redirect('principal:Lara')