import re
from django.contrib import auth, messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
import pandas as pd

file = "assets/example.xlsx"
# Create your views here.
@login_required
def homeView(request):

    market = request.GET.get("market_selected")
    site_enb = request.GET.getlist("select_option")
    dataframe = pd.read_excel(file)[:30]
    enbs = []
    for site in site_enb:
        enbs.append(int(site))
    enblist = set(enbs)
    enb_list = list(enblist)
    df = pd.DataFrame(dataframe)
    markets = df.iloc[:, 0]
    enode_bs = df.iloc[:, 6]
    cell_ids = df.iloc[:, 8]
    df_market = df[df["Market"] == market]
    df_enb = df_market.loc[df_market["eNB ID"].isin(enb_list)]
    # print(df_enb)
    data = df_enb.to_html(
        index=False,
        classes=[
            "table",
            "table-bordered",
            "bg-dark",
            "text-white",
            "table-responsive ",
            "table-responsive-sm",
            "table-responsive-md",
            "table-responsive-lg",
            "table-responsive-xl",
            "table-responsive-xxl",
        ],
    )
    context = {
        "data": data,
        "markets": markets,
        "enode_bs": enode_bs,
        "cell_ids": cell_ids,
    }
    return render(request, "home.html", context)


def loginView(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        user = auth.authenticate(username=username, password=password)

        if user is not None:
            auth.login(request, user)
            messages.success(request, "You are now logged in")
            return redirect("home")
        else:
            messages.error(request, "Invalid credentials")
            return redirect("login")
    else:
        return render(request, "login.html")
