import zipfile
import pandas as pd
from django.contrib import auth, messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
import zipfile


file = "assets/example.xlsx"


def compress(file_names):
    compression = zipfile.ZIP_DEFLATED

    # create the zip file first parameter path/name, second mode
    zf = zipfile.ZipFile("assets/pnpFiles.zip", mode="w")
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
    sid = request.GET.getlist("select_option")
    option_pnp = request.GET.get("pnp")
    option_enb = request.GET.get("enb")
    option_cell = request.GET.get("cell")
    dataframe = pd.read_excel(file)[:20]
    enbs = []
    for site in sid:
        enbs.append(int(site))
    enblist = set(enbs)
    enb_list = list(enblist)
    df = pd.DataFrame(dataframe)
    cell_ids = df.iloc[:, 8]
    df_m_uniqe = df["Market"].unique()
    df_e_unique = df["eNB ID"].unique()
    df_market = df[df["Market"] == market]
    df_enb = df_market.loc[df_market["eNB ID"].isin(enb_list)]
    result_file = "assets/result.xlsx"
    result = df_enb.to_excel(result_file)
    file_names = [
        result_file,
    ]
    zip_file = compress(file_names)
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
        "markets": df_m_uniqe,
        "enode_bs": df_e_unique,
        "cell_ids": cell_ids,
        "zip_file": zip_file,
    }
    return render(request, "home.html", context)


# Login View
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
