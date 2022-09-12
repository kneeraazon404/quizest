from re import A
from django.contrib import admin
from pyparsing import And
from .models import (
    # Test,
    Question,
    Subject,
    System,
    Topic,
    Answer,
    GenerateTest,
    QuestionTest,
    UserQuestion,
    CIStat,
)


# class CategoryAdmin(admin.ModelAdmin):
#     list_display = ("name", "parent", "course")
#     search_fields = ["name"]


class QuestionAdmin(admin.ModelAdmin):

    list_display = ("questionText", "created_at", "subject", "system", "topic")

class SystemAdmin(admin.ModelAdmin):
    list_display = ("system", "subject")

class TopicAdmin(admin.ModelAdmin):
    list_display = ("topic", "system")

class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 4
    verbose_name = "Answer"
    verbose_name_plural = "Answers"
    ordering = ["id"]

class QuestionAdmin(admin.ModelAdmin):
    list_display = ("questionText", "created_at", "subject", "system", "topic")
    inlines = [AnswerInline]

class NoCRUDMixin:
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return True

class GenerateTestAdmin(NoCRUDMixin,admin.ModelAdmin):
    list_display = ("id","user", "completion_status","total_question","total_correct", "score")

class UserQuestionAdmin(NoCRUDMixin,admin.ModelAdmin):
    list_display = ("user", "get_questionid", "is_correct", "is_unused","is_marked")
    
    @admin.display(ordering='id')
    def get_questionid(self, obj):
        return obj.question.id

class QuestionTestAdmin(NoCRUDMixin,admin.ModelAdmin):
    list_display = ("get_testid", "get_questionid", "submitted_answer", "is_correct", "time_taken")

    @admin.display(ordering='id')
    def get_testid(self, obj):
        return obj.test.id

    @admin.display(ordering='id')
    def get_questionid(self, obj):
        return obj.question.id

class CIStatAdmin(NoCRUDMixin,admin.ModelAdmin):
    list_display = ("user", "c_to_i", "i_to_c", "i_to_i")
        
# Register your models here.
# admin.site.register(Test)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Subject)
admin.site.register(System,SystemAdmin)
admin.site.register(Topic,TopicAdmin)
admin.site.register(GenerateTest, GenerateTestAdmin)
admin.site.register(UserQuestion, UserQuestionAdmin)
admin.site.register(CIStat, CIStatAdmin)
admin.site.register(QuestionTest, QuestionTestAdmin)

