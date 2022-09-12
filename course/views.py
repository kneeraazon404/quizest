from http.client import HTTPResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Answer, Course, Question, Subject, System, Topic,GenerateTest,QuestionTest, TempUserQuestionAnswer,UserQuestion, TimeTrack,CIStat
import json
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.views.generic import ListView

from django.http import JsonResponse
import random
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from django.contrib.auth.models import User

from django.db.models import Q
from django.http import Http404
from django.db.models import Avg
from django.db.models import Value, FloatField


def delete(view):
    tempuserquestionanswer = TempUserQuestionAnswer.objects.all().delete()
    print("Tempuserquestionanswer deleted")
    timetrack = TimeTrack.objects.all().delete()
    print("Timetrack deleted")
    userquestion = UserQuestion.objects.all().delete()
    print("Userquestion deleted")
    questionTest = QuestionTest.objects.all().delete()
    print("Questiontest deleted")
    generateTest = GenerateTest.objects.all().delete()
    print("Generatetest deleted")

    return HttpResponse("Deleted")

@login_required
def TestView(request):

    """
    Get the number of questions and create a test
    """
    # if request.method == "GET":
    global status
    
    status = 'all'

    if request.method == "GET":
        
        if request.headers.get('AjaxRequest') == 'GetCount':
            status = request.GET["status"]

            login_user = request.user
            login_user = User.objects.get(username=login_user)

            system = request.GET['system']
            topic = request.GET['topic']
            system = system.split(',')
            topic = topic.split(',')
            q_list = []
            
            for data in system:
                data = data.split("system")
                try:
                    system_id = data[1]
                    system = System.objects.get(id=system_id)
                    data = system.system
                    if status == "unused":
                        total_question_list = Question.objects.filter(system__system = data).values_list('id', flat=True)
                        user_question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(question__system__system = data)).values_list('question__id', flat=True)
                        q_list += [int(item) for item in total_question_list if item not in user_question_list]
                    elif status == "marked":
                        question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_marked=True) & Q(question__system__system = data)).values_list('question__id', flat=True)
                        q_list += [int(item) for item in question_list]
                    elif status == "incorrect":
                        question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=False) & Q(question__system__system = data)).values_list('question__id', flat=True)
                        q_list += [int(item) for item in question_list]
                    elif status == "correct":
                        question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=True) & Q(question__system__system = data)).values_list('question__id', flat=True)
                        q_list += [int(item) for item in question_list]
                    else:
                        question_list = Question.objects.filter(system__system = data).values_list('id', flat=True)
                        q_list += [int(item) for item in question_list]
                except:
                    pass
            
            for data in topic:
                data = data.split("topic")
                try:
                    topic_id = data[1]
                    topic = Topic.objects.get(id=topic_id)
                    data = topic.topic
                    if status == "unused":
                        total_question_list = Question.objects.filter(topic__topic = data).values_list('id', flat=True)
                        user_question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(question__topic__topic = data)).values_list('question__id', flat=True)
                        q_list += [int(item) for item in total_question_list if item not in user_question_list]
                    elif status == "marked":
                        question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_marked=True) & Q(question__topic__topic = data)).values_list('question__id', flat=True)
                        q_list += [int(item) for item in question_list]
                    elif status == "incorrect":
                        question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=False) & Q(question__topic__topic = data)).values_list('question__id', flat=True)
                        q_list += [int(item) for item in question_list]
                    elif status == "correct":
                        question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=True) & Q(question__topic__topic = data)).values_list('question__id', flat=True)
                        q_list += [int(item) for item in question_list]
                    else:
                        question_list = Question.objects.filter(topic__topic = data).values_list('id', flat=True)
                        q_list += [int(item) for item in question_list]
                except:
                    pass

            q_set = set(q_list)
            q_list = list(q_set)
            # print(f"Question Listtt: {q_list}")
            total_ques  = len(q_list)

            data = {
                "count": total_ques,
            }
            return JsonResponse(data,status=200,safe=False)

        if request.headers.get('AjaxRequest') == 'GetSubjectData':
            data = request.GET['data']
            status = data

            login_user = request.user
            login_user = User.objects.get(username=login_user)
            # print(f"Status: {status}")

            question_list = []
            final_question_list = []

            if data == "unused":
                total_question_list = Question.objects.all().values_list('id', flat=True)
                user_question_list = UserQuestion.objects.filter(user=login_user).values_list('question__id', flat=True)
                question_list = [int(item) for item in total_question_list if item not in user_question_list]
            elif data == "marked":
                question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_marked=True)).values_list('question__id', flat=True)
                question_list = [int(item) for item in question_list]
            elif data == "incorrect":
                question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=False)).values_list('question__id', flat=True)
                question_list = [int(item) for item in question_list]
            elif data == "correct":
                question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=True)).values_list('question__id', flat=True)
                question_list = [int(item) for item in question_list]
            else:
                question_list = Question.objects.all().values_list('id', flat=True)
                question_list = [int(item) for item in question_list]

            # print(f"Question List: {question_list}")

            question_set = set(question_list)
            question_list = list(question_set)

            for id in question_list:
                # print(id)
                question = Question.objects.get(id=id)
                final_question_list.append(question)

            # print(f"Question List: {final_question_list}")
            subject_item = {}
            total_question = len(final_question_list)
            if total_question != 0:
                for question in final_question_list:
                    subject_name = question.subject.subject

                    subject_id = question.subject.id
                    if subject_name in subject_item.keys():
                        subject_item[subject_name]['quantity'] += 1
                    else:
                        subject_item[subject_name] = {}
                        subject_item[subject_name]['quantity'] = 1

                    subject_item[subject_name]['id'] = subject_id
            
            # print(f"Subject Item: {subject_item}")
            data = {
                "data": data,
                "subject": subject_item,
            }
            return JsonResponse(data,status=200)

        if request.headers.get('AjaxRequest') == 'GetSystemData':
            status = request.GET["status"]
            # print(f"Status: {status}")
            login_user = request.user
            login_user = User.objects.get(username=login_user)
            data = request.GET['data']
            # print(f"Data: {data}")
            data = data.split(",")
            # Split data by ',' and make a list
            system_item = {}
            topic_item = {}
            q_list = []
            for data in data:
                data = data.split("subject")
                try:
                    subject_id = data[1]
                    subject = Subject.objects.get(id=subject_id)
                    data = subject.subject

                    if status == "unused":
                        total_question_list = Question.objects.filter(subject__subject = data).values_list('id', flat=True)
                        user_question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(question__subject__subject = data)).values_list('question__id', flat=True)
                        q_list += [int(item) for item in total_question_list if item not in user_question_list]
                    elif status == "marked":
                        question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_marked=True) & Q(question__subject__subject = data)).values_list('question__id', flat=True)
                        q_list += [int(item) for item in question_list]
                    elif status == "incorrect":
                        question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=False) & Q(question__subject__subject = data)).values_list('question__id', flat=True)
                        q_list += [int(item) for item in question_list]
                    elif status == "correct":
                        question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=True) & Q(question__subject__subject = data)).values_list('question__id', flat=True)
                        q_list += [int(item) for item in question_list]
                    else:
                        question_list = Question.objects.filter(subject__subject = data).values_list('id', flat=True)
                        q_list += [int(item) for item in question_list]
                
                except:
                    subject_id = 0

                # print(f"Question List: {q_list}")

            q_set = set(q_list)
            q_list = list(q_set)
            final_question_list = []
            for id in q_list:
                # print(id)
                question = Question.objects.get(id=id)
                final_question_list.append(question)

            total_question = len(final_question_list)
            if total_question != 0:
                for question in final_question_list:
                    system_name = question.system.system
                    system_id = question.system.id
                    if system_name in system_item.keys():
                        system_item[system_name]['quantity'] += 1
                    else:
                        system_item[system_name] = {}
                        system_item[system_name]['quantity'] = 1

                    system_item[system_name]['id'] = system_id

                for question in final_question_list:
                    topic_name = question.topic.topic
                    topic_id = question.topic.id
                    if topic_name in topic_item.keys():
                        topic_item[topic_name]['quantity'] += 1
                    else:
                        topic_item[topic_name] = {}
                        topic_item[topic_name]['quantity'] = 1
                    topic_item[topic_name]['id'] = topic_id

            # print(f'Topic Item: {topic_item}')
            # print(f'System Item: {system_item}')
            data = {
                "system": system_item,
                "topic": topic_item,
            }
            return JsonResponse(data,status=200,safe=False)
        
        login_user = request.user
        login_user = User.objects.get(username=login_user)

        total = Question.objects.all().count()

        total_question = Question.objects.all()

        marked = 0
        unused = 0
        incorrect = 0
        correct = 0
        for question in total_question:
            # print(question.id)
            try:
                user_question = UserQuestion.objects.get(user=login_user,question=question)
                # print(user_question.question.id)
                if user_question:
                    if user_question.is_marked == True:
                        # print(f"Marked: {question}")
                        marked += 1
                    if user_question.is_correct == False:
                        incorrect += 1
                    if user_question.is_correct == True:
                        # print(f"Correct: {question}")
                        correct += 1
            except:
                unused += 1

        sub = Subject.objects.all()
        sys = System.objects.all()
        topic = Topic.objects.all()
        c_sub = []
        for i in sub:
            c_sub.append(Question.objects.filter(subject=i).count())
        c_sys = []
        for i in sys:
            c_sys.append(Question.objects.filter(subject__system=i).count())
        systems = System.objects.all()
        subjects = list(zip(sub, c_sub))
        systems = list(zip(sys, c_sys))
        half_point = int(len(systems)//2)
        systems_one = systems[:half_point+1]
        systems_two = systems[half_point+1:]
        # print(subjects, systems)
        context = {
            "total": total,
            "correct": correct,
            "incorrect": incorrect,
            "unused": unused,
            "marked": marked,
            "subjects": subjects,
            "systems": systems,
            "topics": topic,
            "half_point": half_point,
            "systems_one": systems_one,
            "systems_two": systems_two,
        }
        return render(request, "quiz.html", context)
    
    if request.method == 'POST':
        login_user = request.user
        login_user = User.objects.get(username=login_user)
        subjectall = request.POST.get('subjectall')
        systemall = request.POST.get('systemall')
        topicall = request.POST.get('topicall')
        status = request.POST.get('exampleRadios')
        # print(f"Subject: {subjectall}")
        # print(f"System: {systemall}")
        # print(f"Topic: {topicall}")
        # print(f"Status: {status}")
        number_of_question = request.POST.get('number_of_question')

        subject_list = subjectall.split(',')
        system_list = systemall.split(',')
        topic_list = topicall.split(',')
        q_list = []

        # print(f"Subject: {subject_list}")
        # print(f"System: {system_list}")
        # print(f"Topic: {topic_list}")
        for data in system_list:
            data = data.split("system")
            try:
                system_id = data[1]
                system = System.objects.get(id=system_id)
                data = system.system
                if status == "unused":
                    total_question_list = Question.objects.filter(system__system = data).values_list('id', flat=True)
                    user_question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(question__system__system = data)).values_list('question__id', flat=True)
                    q_list += [int(item) for item in total_question_list if item not in user_question_list]
                elif status == "marked":
                    question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_marked=True) & Q(question__system__system = data)).values_list('question__id', flat=True)
                    q_list += [int(item) for item in question_list]
                elif status == "incorrect":
                    question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=False) & Q(question__system__system = data)).values_list('question__id', flat=True)
                    q_list += [int(item) for item in question_list]
                elif status == "correct":
                    question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=True) & Q(question__system__system = data)).values_list('question__id', flat=True)
                    q_list += [int(item) for item in question_list]
                else:
                    question_list = Question.objects.filter(system__system = data).values_list('id', flat=True)
                    q_list += [int(item) for item in question_list]
            except:
                pass
        
        for data in topic_list:
            data = data.split("topic")
            try:
                topic_id = data[1]
                topic = Topic.objects.get(id=topic_id)
                data = topic.topic
                if status == "unused":
                    total_question_list = Question.objects.filter(topic__topic = data).values_list('id', flat=True)
                    user_question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(question__topic__topic = data)).values_list('question__id', flat=True)
                    q_list += [int(item) for item in total_question_list if item not in user_question_list]
                elif status == "marked":
                    question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_marked=True) & Q(question__topic__topic = data)).values_list('question__id', flat=True)
                    q_list += [int(item) for item in question_list]
                elif status == "incorrect":
                    question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=False) & Q(question__topic__topic = data)).values_list('question__id', flat=True)
                    q_list += [int(item) for item in question_list]
                elif status == "correct":
                    question_list = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=True) & Q(question__topic__topic = data)).values_list('question__id', flat=True)
                    q_list += [int(item) for item in question_list]
                else:
                    question_list = Question.objects.filter(topic__topic = data).values_list('id', flat=True)
                    q_list += [int(item) for item in question_list]
            except:
                pass

        q_set = set(q_list)
        q_list = list(q_set)
        final_question_list = []
        for id in q_list:
            # print(id)
            question = Question.objects.get(id=id)
            final_question_list.append(question)

        # print(f"Question List: {final_question_list}")

        question_list = final_question_list
        random.shuffle(question_list)

        # print(f"Question List: {question_list}")

        generated_question = question_list[:int(number_of_question)]
        # for question in generated_question:
            # print(f"Generated Question: {question}")

        context = {}
        try:
            if request.POST['tutor']:
                # print("Tutor Mode is on")
                context["tutor"] = True
        except:
            # print("Tutor Mode is off")
            context["tutor"] = False

        try:
            if request.POST['timed']:
                # print("Timed Mode is on")
                context["timed"] = True
        except:
            # print("Timed Mode is off")
            context["timed"] = False

        testSave = GenerateTest(
            user = login_user,
            timed = context["timed"],
            tutor = context["tutor"],
            total_question = len(generated_question),
            status = status,
        )
        testSave.save()

        latestTest = GenerateTest.objects.latest('id')

        for question in generated_question:
            question = Question.objects.get(id=question.id)
            questionTest = QuestionTest(
                question=question,
                test=latestTest,
            )
            questionTest.save()

            try:
                user_question = UserQuestion.objects.get(user=login_user, question=question)
            except:
                user_question = UserQuestion(
                    user=login_user,
                    question=question,
                )
                user_question.save()

        return redirect('/question?test_id='+str(latestTest.id))


@login_required
def QuestionView(request):
    test_id = request.GET.get("test_id")
    global time_taken

    if request.headers.get('AjaxRequest') == 'GetExplanation':
        user1 = request.user
        login_user = User.objects.get(username = user1)
        question_id = request.GET["question_id"]
        selected_answer = request.GET["answer"]
        selected_answer = int(selected_answer)
        marked = request.GET["marked"]
        time_taken = request.GET["time_taken"]

        questionDetail = Question.objects.get(id=question_id)
        correct_answer = Answer.objects.get(question=questionDetail, right=True)
        # print(f"Correct Answer: {correct_answer}")
        # print(f"Selected Answer: {selected_answer}")

        test = GenerateTest.objects.get(id=int(test_id))
        try:
            questionTest = QuestionTest.objects.get(question=questionDetail, test=test)
        except:
            questionTest = QuestionTest(
                question=questionDetail,
                test=test,
            )
            questionTest.save()
            questionTest = QuestionTest.objects.get(question=questionDetail, test=test)
        
        # print(f"Selected Answer: {selected_answer}")
        try:
            submittedAnswer = Answer.objects.get(id=selected_answer)
        except:
            submittedAnswer = None
        print(f"1.Successfully Landed For question {question_id} with answer {submittedAnswer} and time {time_taken} with marked {marked}")
        # print(f"Submitted Answer: {submittedAnswer}")

        questionTest.submitted_answer = submittedAnswer
        questionTest.time_taken = int(time_taken)
        # print(f"Submitted Answerrrrrrrrrrr: {questionTest.submitted_answer}")

        try:
            user_question = UserQuestion.objects.get(user=login_user, question=questionDetail)
        except:
            user_question = UserQuestion(
                user=login_user,
                question=questionDetail,
            )
            user_question.save()
            user_question = UserQuestion.objects.get(user=login_user, question=questionDetail)

        if submittedAnswer == correct_answer:
            given_answer = True
        else:
            given_answer = False
        print(f"2.Successfully Landed For question {question_id} with answer {submittedAnswer} and time {time_taken} with marked {marked}")

        ci_stat = CIStat.objects.get(user = login_user)
        if given_answer == True:
            prev = ci_stat.i_to_c
            if user_question.is_correct == False:
                ci_stat.i_to_c = int(prev) + 1
            questionTest.is_correct = True
            questionTest.is_omitted = False
        elif given_answer == False:
            prevc = ci_stat.c_to_i
            previ = ci_stat.i_to_i
            if user_question.is_correct == True:
                ci_stat.c_to_i = prevc + 1
            else:
                ci_stat.i_to_i = previ + 1
            # if submittedAnswer != None:
            questionTest.is_omitted = False
            questionTest.is_correct = False

        ci_stat.save()
        questionTest.save()

        if str(marked) == 'true':
            # print("Marked")
            user_question.is_marked = True
        if given_answer == True:
            user_question.is_correct = True

        user_question.save()

        correctly = QuestionTest.objects.filter(Q(question = questionDetail) & Q(is_correct=True)).count()
        total = QuestionTest.objects.filter(question = questionDetail).count()
        if total != 0:
            correct_answered = correctly/total * 100
        else:
            correct_answered = 0

        correct_answered = round(correct_answered, 2)

        questionTotal = QuestionTest.objects.filter(question = questionDetail).exclude(submitted_answer=None).count()
        # print(f"Question Total: {questionTotal}")
        answerList = Answer.objects.order_by("id").filter(question = questionDetail).values_list('answer', flat=True)
        answerPercentageList = []
        for answer in answerList:
            submitAnswerCount = QuestionTest.objects.filter(Q(question = questionDetail) & Q(submitted_answer__answer = answer)).count()
            try:
                answerPercentage = submitAnswerCount/questionTotal * 100
            except:
                answerPercentage = 0
            answerPercentage = round(answerPercentage, 0)
            answerPercentage = int(answerPercentage)
            # print(f"Answer Percentage: {answerPercentage}")
            answerPercentageList.append(answerPercentage)

        try:
            submitted_answer = questionTest.submitted_answer
            submitted_answer = submitted_answer.answer
        except:
            submitted_answer = ""
        
        # print(f"Answer Percentage List: {answerPercentageList}")
        # print(f"Answer List: {answerList}")
        # print(f"Submitted Answer: {submitted_answer}")
        # print(f"Correct Answer: {correct_answer}")

        correct_answer = correct_answer.answer
        print(f"1.Successfully Landed For question {question_id} with answer {submittedAnswer} and time {time_taken} with marked {marked}")

        context = {
            'question': questionDetail,
            'given_answer': given_answer,
            'correct_answer': correct_answer,
            'time_taken': time_taken,
            'correct_answered': correct_answered,
            'answerPercentageList': answerPercentageList,
            'answerList': answerList,
            'submitted_answer': submitted_answer,
        }
        return render(request, "explanation.html", context)

    if request.headers.get('AjaxRequest') == 'CheckAnswer':
        user1 = request.user
        login_user = User.objects.get(username = user1)
        question_id = request.GET["question_id"]
        selected_answer = request.GET["answer"]
        selected_answer = int(selected_answer)
        marked = request.GET["marked"]
        time_taken = request.GET["time_taken"]

        questionDetail = Question.objects.get(id=question_id)
        correct_answer = Answer.objects.get(question=questionDetail, right=True)

        print(f"Selected Answer: {selected_answer}")
        try:
            submittedAnswer = Answer.objects.get(id=selected_answer)
        except:
            submittedAnswer = None
        print(f"Submitted Answer: {submittedAnswer}")

        test = GenerateTest.objects.get(id=int(test_id))
        try:
            questionTest = QuestionTest.objects.get(question=questionDetail, test=test)
        except:
            questionTest = QuestionTest(
                question=questionDetail,
                test=test,
            )
            questionTest.save()
            questionTest = QuestionTest.objects.get(question=questionDetail, test=test)
        
        questionTest.time_taken = int(time_taken)
        questionTest.submitted_answer = submittedAnswer
        print(f"1.Successfully Landed For question {question_id} with answer {submittedAnswer} and time {time_taken} with marked {marked}")

        if submittedAnswer == correct_answer:
            given_answer = True
        else:
            given_answer = False

        ci_stat = CIStat.objects.get(user = login_user)
        if given_answer == True:
            prev = ci_stat.i_to_c
            if questionTest.is_correct == False:
                ci_stat.i_to_c = int(prev) + 1
            questionTest.is_correct = True
            questionTest.is_omitted = False
        elif given_answer == False:
            prevc = ci_stat.c_to_i
            previ = ci_stat.i_to_i
            if questionTest.is_correct == True:
                ci_stat.c_to_i = int(prevc) + 1
            else:
                ci_stat.i_to_i = int(previ) + 1
            questionTest.is_omitted = False
            questionTest.is_correct = False

        ci_stat.save()
        questionTest.save()
        print(f"2.Successfully Landed For question {question_id} with answer {submittedAnswer} and time {time_taken} with marked {marked}")

        try:
            user_question = UserQuestion.objects.get(user=login_user, question=questionDetail)
        except:
            user_question = UserQuestion(
                user=login_user,
                question=questionDetail,
            )
            user_question.save()
            user_question = UserQuestion.objects.get(user=login_user, question=questionDetail)

        if marked == "true":
            user_question.is_marked = True
        if given_answer == True:
            user_question.is_correct = True

        user_question.save()
        print(f"3.Successfully Landed For question {question_id} with answer {submittedAnswer} and time {time_taken} with marked {marked}")

        data = {
            'is_correct': given_answer,
        }
        return JsonResponse(data,status=200)

    if request.method == 'POST':
        user1 = request.user
        login_user = User.objects.get(username = user1)
        test_id = request.POST.get("test_id")
        test = GenerateTest.objects.get(id=int(test_id))

        total_question = test.total_question
        # print(f"Total Question: {total_question}")
        correct_answer = QuestionTest.objects.filter(Q(test=test) & Q(is_correct=True)).count()
        # print(f"Correct Answer: {correct_answer}")
        test.total_correct = correct_answer
        incorrect_answer = QuestionTest.objects.filter(Q(test=test) & Q(is_correct=False) &Q(is_omitted=False)).count()
        test.total_incorrect = incorrect_answer
        score = float(correct_answer)/float(total_question) * 100
        score = round(score, 2)
        # print(f"Score: {score}")
        test.score = score

        is_omitted = QuestionTest.objects.filter(Q(test=test) & Q(is_omitted=True)).count()
        
        if is_omitted == 0:
            test.completion_status = True
        else:
            test.completion_status = False

        test.save()

        try:
            timetrack = TimeTrack.objects.get(user=login_user, test__id=test_id)
            timetrack.delete()
        except:
            pass
        
        total_submitted = QuestionTest.objects.filter(test=test).exclude(is_omitted=True).count()

        if total_submitted == total_question:
            completion_status = True
        else:
            completion_status = False
        # print(f"Completion Status: {completion_status}")

        original_test = GenerateTest.objects.get(id=int(test_id))
        original_test.completion_status = completion_status
        original_test.score = score
        original_test.save()

        return redirect('/result?test_id='+str(test_id))

    try:
        test_id = request.GET.get("test_id")
        user1 = request.user
        login_user = User.objects.get(username = user1)

        test = GenerateTest.objects.get(user = login_user, id = test_id)
        questions_list = QuestionTest.objects.filter(test=test).order_by("question__id")
        total_question = questions_list.count()
        total_question_list = [*range(1, total_question + 1)]
        max_time_needed = total_question * 120
        time_till = 0
        try:
            timetrack = TimeTrack.objects.get(user=login_user, test=test)
            try:
                timetrack.time_taken_till = timetrack.time_taken_till + int(time_taken)
                timetrack.save()
            except:
                pass
            time_till = timetrack.time_taken_till
        except:
            timetrack = TimeTrack(
                user = login_user,
                test = test,
            )
            timetrack.save()
        finally:
            remaining_time = max_time_needed - time_till

        # print(f"Remaining Time: {remaining_time}")

        page = request.GET.get("page", 1)
        # print(f"page: {page}")

        paginator = Paginator(questions_list, 1)

        try:
            questions = paginator.page(page)
        except PageNotAnInteger:
            questions = paginator.page(1)
        except EmptyPage:
            questions = paginator.page(paginator.num_pages)

        is_correct = QuestionTest.objects.filter(Q(test=test) & Q(is_correct=True)).values_list('question__id', flat=True)
        is_incorrect = QuestionTest.objects.filter(Q(test=test) & Q(is_correct=False) & Q(is_omitted=False)).values_list('question__id', flat=True)

        correct_page = []
        incorrect_page = []
        for i in total_question_list:
            pagei = int(i) - 1
            pageid = questions_list[pagei].question.id  
            if pageid in is_correct:
                correct_page.append(i)
            if pageid in is_incorrect:
                incorrect_page.append(i)

        q = questions[0].question.id
        submitted_page = correct_page + incorrect_page
        submitted_page = sorted(submitted_page)

        i = 1
        try:
            while i < max(submitted_page):
                if i not in submitted_page:
                    break
                i = i + 1

            i = i + 1
        except:
            pass

        last_p = i 

        context = {
            "questions": questions,
            'test_id': test_id,
            'current_page': int(page),
            'total_question': total_question,
            'total_question_list': total_question_list,
            'correct_page': correct_page,
            'incorrect_page': incorrect_page,
            'submitted_page': submitted_page,
            'remaining_time': remaining_time,
        }

        if int(page) in submitted_page:
            submitQuestion = Question.objects.get(id=q)
            questionTest = QuestionTest.objects.get(test__id=test_id, question=submitQuestion)

            questionTotal = QuestionTest.objects.filter(question = submitQuestion).exclude(submitted_answer=None).count()
            # print(f"Question Total: {questionTotal}")
            answerList = Answer.objects.order_by("id").filter(question = submitQuestion).values_list('answer', flat=True)
            answerPercentageList = []
            for answer in answerList:
                submitAnswerCount = QuestionTest.objects.filter(Q(question = submitQuestion) & Q(submitted_answer__answer = answer)).count()
                try:
                    answerPercentage = submitAnswerCount/questionTotal * 100
                except:
                    answerPercentage = 0
                answerPercentage = round(answerPercentage, 0)
                answerPercentage = int(answerPercentage)
                # print(f"Answer Percentage: {answerPercentage}")
                answerPercentageList.append(answerPercentage)

            # print(f"Answer Percentage List: {answerPercentageList}")
            # print(f"Answer List: {answerList}")

            try:
                submitted_answer = questionTest.submitted_answer
                submitted_answer = submitted_answer.answer
            except:
                submitted_answer = ""
            # print(f"Submitted Answer: {submitted_answer}")

            correct_answer = Answer.objects.get(question=submitQuestion, right=True)
            correct_answer = correct_answer.answer

            correctly = QuestionTest.objects.filter(Q(question = submitQuestion) & Q(is_correct=True)).count()
            total = QuestionTest.objects.filter(question = submitQuestion).count()
            if total != 0:
                correct_answered = correctly/total * 100
            else:
                correct_answered = 0

            correct_answered = round(correct_answered, 2)

            context['submitQuestion'] = submitQuestion
            context['questionTest'] = questionTest
            context['correct_answered'] = correct_answered
            context['correct_answer'] = correct_answer
            context['submitted_answer'] = submitted_answer
            context['answerPercentageList'] = answerPercentageList

        try:
            page_id = request.GET.get("page")
            currrent_path = request.get_full_path()
            # print(f"Current Path: {currrent_path}")
            current_path = currrent_path.split("?")
            try:
                is_page = current_path[-1].split("&")
                is_page = is_page[-1].split("=")
                is_page = is_page[0]
            except:
                is_page = "test_id"
            # print(f"Is Page: {is_page}")
            if is_page == "test_id":

                if last_p != page_id:
                    url = '/question?test_id=' + str(test_id) + '&page=' + str(last_p)
                    # print(url)
                    return redirect(url)
        except:
            pass

        return render(request, "question.html", context)
    except:
        raise Http404("You are not allowed to access this page")

@login_required
def score(request):
    test_id = request.GET.get("test_id")
    test_id = int(test_id)
    login_iser = request.user
    login_user = User.objects.get(username = login_iser)
    try:
        test = GenerateTest.objects.get(user=login_user, id=test_id)
        score = test.score
        context = {
            'score' : score,
        }
        return render(request, "thank_you.html", context)

    except:
        raise Http404("You are not allowed to access this page")

@login_required
def stat(request):
    login_iser = request.user
    login_user = User.objects.get(username = login_iser)

    correct = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=True)).values_list('question__id', flat=True)
    correctSet = set(correct)
    correctList = list(correctSet)
    total_correct = len(correctList)
    incorrect = UserQuestion.objects.filter(Q(user=login_user) & Q(is_correct=False)).values_list('question__id', flat=True)
    incorrectSet = set(incorrect)
    incorrectList = list(incorrectSet)
    total_incorrect = len(incorrectList)
    omitted = QuestionTest.objects.filter(Q(test__user=login_user) & Q(is_omitted=True)).values_list('question__id', flat=True)
    omittedSet = set(omitted)
    omittedList = list(omittedSet)
    total_omitted = len(omittedList)
    ci_stat = CIStat.objects.get(user=login_user)
    c_to_i = ci_stat.c_to_i
    i_to_c = ci_stat.i_to_c
    i_to_i = ci_stat.i_to_i
    total_question = Question.objects.all().count()
    used_question = UserQuestion.objects.filter(user=login_user).count()
    unused_question = total_question - used_question
    test_created = GenerateTest.objects.filter(user=login_user).count()
    test_completed = GenerateTest.objects.filter(Q(user=login_user) & Q(completion_status=True)).count()
    suspended_test = test_created - test_completed
    y_average_time = QuestionTest.objects.filter(Q(test__user=login_user) & Q(is_omitted=False)).aggregate(Avg('time_taken'))
    y_average_time = y_average_time['time_taken__avg']
    try:
        y_average_time = round(y_average_time, 2)
    except:
        y_average_time = 0
    o_average_time = QuestionTest.objects.filter(is_omitted=False).exclude(test__user=login_user).aggregate(Avg('time_taken'))
    o_average_time = o_average_time['time_taken__avg']
    try:
        o_average_time = round(o_average_time, 2)
    except:
        o_average_time = 0

    prev_test = GenerateTest.objects.order_by('id').filter(user=login_user)

    context = {
        'total_correct': total_correct,
        'total_incorrect': total_incorrect,
        'total_omitted': total_omitted,
        'c_to_i': c_to_i,
        'i_to_c': i_to_c,
        'i_to_i': i_to_i,
        'total_question': total_question,
        'used_question': used_question,
        'unused_question': unused_question,
        'test_created': test_created,
        'test_completed': test_completed,
        'suspended_test': suspended_test,
        'y_average_time': y_average_time,
        'o_average_time': o_average_time,
        'prev_test': prev_test,
    }
    return render(request, "stat.html", context)

@login_required
def test_result(request):
    test_id = request.GET.get("test_id")
    average_score = GenerateTest.objects.filter(completion_status = True).aggregate(Avg('score'))
    average_score = average_score['score__avg']
    your_score  = GenerateTest.objects.get(id=test_id)
    your_score = your_score.score
    login_iser = request.user
    login_user = User.objects.get(username = login_iser)

    try:
        test = GenerateTest.objects.get(user=login_user, id=test_id)

        questionList = []
        questions = QuestionTest.objects.filter(test__id = test_id).order_by("question__id").values_list('question')
        
        for question in questions:
            try:
                total_question = QuestionTest.objects.filter(Q(question = question)).exclude(test = test).count()
                correct_other = QuestionTest.objects.filter(Q(question = question) & Q(is_correct = True)).exclude(test = test).count()
                correct_percentage = (correct_other/total_question) * 100
                correct_percentage = round(correct_percentage, 2)
            except:
                correct_percentage = 0            

            questionList += QuestionTest.objects.filter(Q(test__id = test_id) & Q(question = question)).annotate(correct_percentage=Value(correct_percentage, output_field=FloatField()))
        
        try:
            average_score = float(average_score)
            average_score = round(average_score, 2)
        except:
            average_score = 0
        try:
            your_score = float(your_score)
            your_score = round(your_score, 2)
        except:
            your_score = 0

        # average_score = 35
        # your_score = 65

        context = {
            'test': test,
            'questionList': questionList,
            'average_score': average_score,
            'your_score': your_score,
            'test_id': test_id,
        }
        if average_score > your_score:
            greater = True
            context['greater'] = greater
            difference = average_score - your_score
            context['difference'] = difference
        elif average_score < your_score:
            greater = False
            context['greater'] = greater
            difference = your_score - average_score
            context['difference'] = difference
        else:
            equal = True
            context['equal'] = equal

        return render(request, "test_result.html", context)
    except:
        raise Http404("You are not allowed to access this page")

# EndForTest

def course_list(request):
    return render(request, "courses.html")


def index(request):
    courses = Course.objects.all()

    return render(request, "index.html", {"courses": courses})



@login_required
@csrf_exempt
def profile(request):
    data = {}
    if request.method == "POST":
        firstname = request.POST.get("firstname")
        lastname = request.POST.get("lastname")
        email = request.POST.get("email")

        if request.POST.get("email"):
            request.user.first_name = firstname
            request.user.last_name = lastname
            request.user.email = email
            request.user.save()

        data["profile_update"] = True

    return render(request, "profile.html", data)


def pricing(request):
    return render(request, "pricing.html")

def QuestionsView(request):
    questions_list = Question.objects.all().order_by("id")
    page = request.GET.get("page", 1)
    paginator = Paginator(questions_list, 1)

    try:
        questions = paginator.page(page)
    except PageNotAnInteger:
        questions = paginator.page(1)
    except EmptyPage:
        questions = paginator.page(paginator.num_pages)

    context = {
        "questions": questions,
    }
    return render(request, "questions.html", context)

'''
def SubjectView(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        data = request.GET['data']

        if data == "unused":
            question_list = Question.objects.filter(is_unused=True)
        elif data == "marked":
            question_list = Question.objects.filter(is_marked=True)
        elif data == "incorrect":
            question_list = Question.objects.filter(is_incorrect=True)
        elif data == "correct":
            question_list = Question.objects.filter(is_correct=True)
        else:
            question_list = Question.objects.all()

        subject_item = {}
        total_question = question_list.count()
        if total_question != 0:
            for question in question_list:
                subject_name = question.subject.subject

                if subject_name in subject_item.keys():
                    subject_item[subject_name] += 1
                else:
                    subject_item[subject_name] = 1
                
        # print(subject_item)
        data = {
            "data": data,
            "subject": subject_item,
            "total": total_question
        }
        return JsonResponse(data,status=200)

def SystemView(request):
    # print("Outsiiiide")
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        data = request.GET['data']
        # print(data)

        return JsonResponse(data,status=200)

'''
# @login_required
def HomepageView(request, course_id=None):

    course = Course.objects.all()

    # Question.objects.create(question=data["question"], correctAnswerIndex=data["correctAnswerIndex"], exp=data["exp"], course=course)

    # for x in subjects:
    #     if x["name"] == "Miscellaneous":
    #         mainCat = Category.objects.create(name=x["name"] + " - " + course.name, course=course, isMainCategory=True)
    #     else:
    #         mainCat = Category.objects.create(name=x["name"], course=course, isMainCategory=True)

    #     for y in x["data"]:
            # print(y["name"], ": Topic")
    #         mainCatSec = ""
    #         if y["name"] == "Miscellaneous":
    #             mainCatSec = Category.objects.create(name=y["name"] + " - " + mainCat.name, course=course, parent=mainCat)
    #         else:
    #             mainCatSec = Category.objects.create(name=y["name"], course=course, parent=mainCat)

    #         for z in y["categorys"]:
    #             if z["name"] == "Miscellaneous":
    #                 Category.objects.create(name=z["name"] + " - " + mainCatSec.name, course=course, parent=mainCatSec)
    #             else:
    #                 Category.objects.create(name=z["name"], course=course, parent=mainCatSec)

    # for x in data:
        # print(x["category"], x["parent"])
    #     cat = Category.objects.get(name=x["category"], parent__name=x["parent"])
    #     que = Question.objects.create(question=x["question"], correctAnswerIndex=x["correctAnswerIndex"], exp=x["exp"], course=course)
    #     cat.question.add(que)

    # category = Category.objects.filter(course=course)

    categories = ""

    questions = []

    subjects = []

    # for x in categories:
    #     datalist = []

    #     for y in x.get_children():
    #         ques = []
    #         que_ids = []
    #         my_categories = []

    #         for z in y.question.all():
    #             ques.append(
    #                 {
    #                     "question": "",
    #                     "exp": "",
    #                     "id": z.id,
    #                 }
    #             )

    #             que_ids.append(z.id)

    #         for i in y.get_children():
    #             my_categories.append(
    #                 {
    #                     "name": i.name,
    #                     "idList": list(i.question.values_list("id", flat=True)),
    #                     "length": len(i.question.values_list("id", flat=True)),
    #                 }
    #             )

    #             for question in i.question.all():
    #                 questions.append(
    #                     {
    #                         "correctAnswerIndex": question.correctAnswerIndex,
    #                         "exp": question.exp,
    #                         "question": question.question,
    #                         "id": question.id,
    #                     }
    #                 )

    #         datalist.append(
    #             {
    #                 "categorys": my_categories,
    #                 "name": y.name,
    #                 "length": y.question.count(),
    #             }
    #         )

    #     count = []

    #     for c in datalist:
    #         for d in c["categorys"]:
    #             count.append(d["length"])

    #     subjects.append({"name": x.name, "length": sum(count), "data": datalist})

    # datax = {
    #     "courseName": course.courseName,
    #     "courseUniqueId": course.id,
    #     "subjects": subjects,
    # }

    datax = []

    q = json.dumps(questions)

    return render(
        request, "Homepage.html", {"questions": questions, "q": q, "datax": datax}
    )

