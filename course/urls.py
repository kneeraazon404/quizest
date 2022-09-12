from django.urls import path
from . import views
from django.views.generic import TemplateView

# app_name = "course"

urlpatterns = [
    path("", views.index, name="index"),
    # path("<int:course_id>/", views.course, name="course"),
    path("home", views.HomepageView, name="home"),
    path("questions", views.QuestionsView, name="questions"),
    path("question", views.QuestionView, name="question"),
    path("profile/", views.profile, name="profile"),
    path("pricing/", views.pricing, name="pricing"),
    path("test/", views.TestView, name="test"),
    path("score", views.score, name="score"),
    path("stat", views.stat, name="stat"),
    path("result", views.test_result, name="test_result"),
    path(
        "qbank-module/",
        TemplateView.as_view(template_name="Module.html"),
        name="qbank-module",
    ),
    path(
        "qbanl-module-values/",
        TemplateView.as_view(template_name="Values.html"),
        name="qbank-module-values",
    ),
]
