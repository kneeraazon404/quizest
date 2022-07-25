import csv
import os
import shutil
import zipfile
from datetime import date

import pandas as pd
from django.contrib import auth , messages
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import redirect , render

def delete_files():
    folder = 'assets/results/'
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print('Failed to delete %s. Reason: %s' % (file_path, e))

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
    cells = request.GET.getlist("cell_option")
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
    dataframe = pd.read_excel(file)
    df = pd.DataFrame(dataframe)
    df_m_uniqe = df["Market"].unique()
    df_e_unique = df["eNB ID"].unique()
    df_cell_unique = df["Cell ID"].unique()
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
    # headers = ["User", "Market", "Select Option", "eNB ID", "Cell ID", "Time"]
    with open("assets/logs.csv", "a") as f:
        writer = csv.writer(f)
        # writer.writerow(headers)
        writer.writerow([user, market, select_option, enb_list, cell_list, time_of_act])
        f.close()

    # Files Create Section
    option_pnp = request.GET.get("pnp")
    option_enb = request.GET.get("enb")
    option_cell = request.GET.get("cell")
    result_file1 = r"assets/results/result1.csv"
    result_file2 = r"assets/results/result2.csv"
    result_file3 = r"assets/results/result3.xlsx"
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
        "cell_ids": df_cell_unique,
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
    delete_files()
    return response
