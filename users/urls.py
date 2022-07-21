from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path("", views.homeView, name="home"),
    path("login/", views.loginView, name="login"),
    path("file/", views.fileView, name="file"),
]
