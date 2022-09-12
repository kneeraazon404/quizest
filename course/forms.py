from django import forms
from django.contrib.auth.forms import UserCreationForm
from allauth.account.forms import LoginForm, SignupForm
from django.contrib.auth.models import User
from django import forms


class Loginform(LoginForm):
    def __init__(self, *args, **kwargs):
        super(Loginform, self).__init__(*args, **kwargs)

        self.fields["login"] = forms.CharField(
            max_length=100,
            label="Username",
            widget=forms.TextInput(
                attrs={
                    "placeholder": "johndoe",
                    "class": "form-control",
                    "id": "input-email",
                }
            ),
        )
        self.fields["password"] = forms.CharField(
            label="Password",
            widget=forms.PasswordInput(
                attrs={
                    "placeholder": "Password",
                    "class": "form-control",
                    "id": "input-password",
                }
            ),
        )
