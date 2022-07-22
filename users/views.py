import zipfile
import csv
import pandas as pd
from django.contrib import auth, messages
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import redirect, render
from datetime import date

file = "assets/example.xlsx"
zip_file = "assets/pnpfiles.zip"


def compress(file_names):

    """
    Compress a list of files into a zip file.
    """

    compression = zipfile.ZIP_DEFLATED
    # create the zip file first parameter path/name, second mode
    zf = zipfile.ZipFile("assets/pnpfiles.zip", mode="w")
    try:
        for file_name in file_names:
            # Add file to the zip file
            # first parameter file to zip, second filename in zip
            zf.write(file_name, file_name, compress_type=compression)
    except FileNotFoundError:
        print("An error occurred")
    finally:
        # Don't forget to close the file!
        zf.close()


@login_required
def homeView(request):
    market = request.GET.get("market_selected")
    select_option = request.GET.get("selected_option")
    sid = request.GET.getlist("site_nodes")
    cell = request.GET.getlist("cell_option")
    sid = request.GET.getlist("site_nodes")
    cells = request.GET.getlist("cell_option")
    dataframe = pd.read_excel(file)
    enbs = []
    for site in sid:
        enbs.append(int(site))
    cell_ids = []
    for cell in cells:
        cell_ids.append(int(cell))
    enblist = set(enbs)
    enb_list = list(enblist)
    celllist = set(cell_ids)
    cell_list = list(celllist)
    df = pd.DataFrame(dataframe)
    cell_ids = df.iloc[:, 8]
    df_m_uniqe = df["Market"].unique()
    df_e_unique = df["eNB ID"].unique()
    df = df[df["Market"] == market]
    df = df.loc[df["eNB ID"].isin(enb_list)]
    if cells:
        df = df.loc[df["Cell ID"].isin(cell_list)]
    else:
        pass

    # User logs Section
    user = request.user
    today = date.today()
    time_of_act = today.strftime("%d/%m/%Y")
    headers = ["User", "Market", "Select Option", "eNB ID", "Cell ID", "Time"]
    with open("assets/logs.csv", "a") as f:
        writer = csv.writer(f)
        # writer.writerow(headers)
        writer.writerow([user, market, select_option, sid, cell, time_of_act])
        f.close()

    # Files Create Section
    option_pnp = request.GET.get("pnp")
    option_enb = request.GET.get("enb")
    option_cell = request.GET.get("cell")
    result_file1 = r"assets/result1.csv"
    result_file2 = r"assets/result2.csv"
    result_file3 = r"assets/result3.xlsx"
    file_names = []
    if option_pnp is not None:
        df.to_csv(result_file1, index=False)
        file_names.append(result_file1)
    if option_enb is not None:
        df.to_csv(result_file2, index=False)
        file_names.append(result_file2)
    if option_cell is not None:
        df.to_excel(result_file3)
        file_names.append(result_file3)

    # Call Zip Compress Function

    compress(file_names)

    # Create HTML table from dataframe with selected filters
    data = df.to_html(
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

    # Passing context to the template
    context = {
        "data": data,
        "markets": df_m_uniqe,
        "enode_bs": df_e_unique,
        "cell_ids": cell_ids,
    }
    return render(request, "home.html", context)


def loginView(request):

    """
    Login view. If user is logged in, redirect to home page.
    """
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


# File Download view with file response
def fileView(request):
    """
    File download view. Directly download the file from the server that is recently generated
    """
    response = HttpResponse(
        open("assets/pnpfiles.zip", "rb"), content_type="application/zip"
    )
    return response
