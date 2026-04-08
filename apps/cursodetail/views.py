from django.shortcuts import render
from django.contrib.auth.decorators import login_required
# Create your views here.
@login_required
def curso_detail(request):
    return render(request,'cursodetail/cursodetail.html')