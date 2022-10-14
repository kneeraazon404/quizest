from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, get_object_or_404, render, HttpResponseRedirect

# relative import of forms
from course.forms import ProfileUpdateForm, StoreForm, UserRegisterForm, UserUpdateForm
from django.contrib.auth.models import User
from course.models import Store


@login_required
def dashboard(request):
    users = User.objects.all().order_by("-date_joined")[:3]
    stores = Store.objects.all().order_by("-created_at")[:3]
    return render(request, "dashboard.html", {"users": users, "stores": stores})


@login_required
def create_view(request):
    # dictionary for initial data with
    # field names as keys
    context = {}
    if request.method == "POST":
        form = StoreForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect("dashboard")
    else:
        form = StoreForm()
        context["form"] = form
        return render(request, "store_form.html", context)

    form = StoreForm(request.POST or None)
    context["form"] = form
    return render(request, "store_form.html", context)


# update view for details
@login_required
def update_view(request, id):
    # dictionary for initial data with
    # field names as keys
    context = {}
    if request.method == "POST":

        # fetch the object related to passed id
        obj = get_object_or_404(Store, id=id)

        # pass the object as instance in form
        form = StoreForm(request.POST or None, instance=obj)

        # save the data from the form and
        # redirect to detail_view
        if form.is_valid():
            form.save()
            return HttpResponseRedirect("/")

        # add form dictionary to context
        context["form"] = form

        return render(request, "update_view.html", context)
    obj = get_object_or_404(Store, id=id)
    form = StoreForm(request.POST or None, instance=obj)
    context["form"] = form
    return render(request, "update_view.html", context)


# delete view for details
@login_required
def delete_view(request, id):
    # dictionary for initial data with
    # field names as keys
    context = {}

    # fetch the object related to passed id
    obj = get_object_or_404(Store, id=id)

    if request.method == "POST":
        # delete object
        obj.delete()
        # after deleting redirect to
        # home page
        return HttpResponseRedirect("/")

    return render(request, "delete_view.html", context)


def register(request):
    if request.method == "POST":
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get("username")
            messages.success(
                request, f"Your account has been created! You are now able to log in"
            )
            return redirect("dashboard")
    else:
        form = UserRegisterForm()
    return render(request, "account/register.html", {"form": form})


@login_required
def profile(request):
    if request.method == "POST":
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = ProfileUpdateForm(
            request.POST, request.FILES, instance=request.user.profile
        )
        if u_form.is_valid and p_form.is_valid:
            u_form.save()
            p_form.save()
        messages.success(
            request, f"Your account has been created! You are now able to log in"
        )
        return redirect("dashboard")

    else:
        u_form = UserUpdateForm(instance=request.user)
        p_form = ProfileUpdateForm(instance=request.user.profile)

    context = {"u_form": u_form, "p_form": p_form}
    return render(request, "account/profile.html", context)
