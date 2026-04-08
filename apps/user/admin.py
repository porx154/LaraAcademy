from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from apps.user.models import User
# Register your models here.
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'tipousuario', 'is_staff', 'is_active']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información extra', {'fields': ('tipousuario',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'tipousuario'),
        }),
    )
    #fields = ['email', 'password', 'tipousuario', 'is_staff', 'is_active']