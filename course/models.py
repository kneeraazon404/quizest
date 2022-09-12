from email.mime import image
import re
from secrets import choice
from tabnanny import verbose
from django.db import models
from pyrsistent import v

from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Subject(models.Model):
    """subject names will be added by the admins to the database

    Args:
        it will contain the name of the subjects and that will be used to create the questions and answers
    Returns:
        _type_: _description_
    """

    subject = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.subject


class System(models.Model):
    """system names will be added by the admins to the database

    Args:
        it will contain the names of the systems and that will be used to created relating to the subjects
    Returns:
        _type_: _description_
    """

    system = models.CharField(max_length=100)
    subject = models.ForeignKey(Subject, related_name="system", on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.system


class Topic(models.Model):
    """
    This contains the sub systems or the topics of the system that will relate to one system while creating it.
    """

    topic = models.CharField(max_length=100)
    system = models.ForeignKey(System, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.topic


class Question(models.Model):
    questionText = models.TextField(max_length=150)
    image = models.ImageField(upload_to="question/images/", blank=True)
    
    subject = models.ForeignKey(Subject, on_delete=models.PROTECT,editable=False)
    system = models.ForeignKey(System, on_delete=models.PROTECT,editable=False)
    topic = models.ForeignKey(Topic, on_delete=models.PROTECT)

    # hint = models.TextField(max_length=500)
    explainationText = models.TextField(max_length=500)
    explaination_image = models.ImageField(upload_to="question/images/explanation/", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.questionText

    def get_answers(self):
        return self.answer_set.all()[: self.count()]

    def save(self, *args, **kwargs):
        systemObject = self.topic.system
        self.system = systemObject
        self.subject = systemObject.subject

        super(Question, self).save(*args, **kwargs)

class Answer(models.Model):

    question = models.ForeignKey(Question, on_delete=models.CASCADE,blank=True,null=True)
    answer = models.TextField(max_length=10)
    right = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.answer


class Course(models.Model):
    """Model contains the New test/Course details

    # Note * It will be considered as test in other files
    # it will let user edit test name and description. users can go to their tests list and make edits there
        Args:
            course (str): contains the course name that will be unique for each test created by the users to be saved on the database
            it will also contain two variables:
            for the test modes
            1. tutor mode: lets the user read the test and answer the questions
            2. timed (if the test is timed or not)

        Returns:
            str: returns the name and id of the course/test being created
    """

    courseName = models.CharField(max_length=100)
    description = models.CharField(max_length=200, blank=True)
    timed = models.BooleanField(default=False, blank=True)
    tutor = models.BooleanField(default=False, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.courseName

class GenerateTest(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT,default=None,blank=True,null=True)
    timed = models.BooleanField(default=False)
    tutor = models.BooleanField(default=False)
    status = models.CharField(max_length=100,default="None")
    total_question = models.IntegerField(default=0)
    total_correct = models.IntegerField(default=0)
    total_incorrect = models.IntegerField(default=0)
    completion_status = models.BooleanField(default=False)
    score = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class QuestionTest(models.Model):
    question = models.ForeignKey(Question, on_delete=models.PROTECT)
    test = models.ForeignKey(GenerateTest, on_delete=models.PROTECT)
    submitted_answer = models.ForeignKey(Answer, on_delete=models.PROTECT,blank=True,null=True)
    is_correct = models.BooleanField(default=False)
    is_omitted = models.BooleanField(default=True)
    time_taken = models.IntegerField(default=0)

class UserQuestion(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    question = models.ForeignKey(Question, on_delete=models.PROTECT)
    is_unused = models.BooleanField(default=False)
    is_marked = models.BooleanField(default=False)
    is_correct = models.BooleanField(default=False)
    class Meta:
        unique_together = ('user', 'question')
class CIStat(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    c_to_i = models.IntegerField(default=0)
    i_to_c = models.IntegerField(default=0)
    i_to_i = models.IntegerField(default=0)

@receiver(post_save, sender=User)
def create_CIStat_profile(sender, instance, created, **kwargs):
    if created:
        CIStat.objects.create(user=instance)
class TimeTrack(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    test = models.ForeignKey(GenerateTest, on_delete=models.PROTECT)
    time_taken_till = models.IntegerField(default=0)

class TempUserQuestionAnswer(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    test = models.ForeignKey(GenerateTest, on_delete=models.PROTECT)
    question = models.ForeignKey(Question, on_delete=models.PROTECT)
    answer = models.ForeignKey(Answer, on_delete=models.PROTECT)
    is_correct = models.BooleanField(default=False)

    class Meta:
        unique_together = ('test', 'question')