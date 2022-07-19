from datetime import datetime
import os
from glob import glob
import pandas as pd
import numpy as np
import csv
import re
import zipfile
import base64


def write_dataframes_to_excel_sheet(
    MKT, dataframes, sid, ciq_selection, option_pnp, option_enb, option_cell
):
    zip_file_name = "test_file"
    # PROCESS HERE WHERE EACH FILE IS CREATED IF THERE WAS A Selection
    # PROCESS FOR PNP returns an excel file
    # PROCESS FOR eNB returns an excel file
    # PROCESS FOR cell returns an excel file
    pnp_files_to_zip = [
        "PNP FILE",
        "ENB FILE",
        "CELL FILE",
    ]  # these are csv files that will be zipped, you can simulate using what ever files you want.
    # Next zip will be created for each element of the list if you chose enb, if you chose cell id, then only one file will be created.
    if True in [option_pnp, option_enb, option_cell]:  #
        try:
            with zipfile.ZipFile(f"{zip_file_name}.zip", "w") as myzip:
                for f in pnp_files_to_zip:
                    f = f"{f}.csv"
                    myzip.write(os.path.join(dir, f), f)
                    os.remove(os.path.join(dir, f))

            ZipfileDotZip = f"{dir}{zip_file_name}.zip"

            with open(ZipfileDotZip, "rb") as f:
                # idially i want a button for downloading each file.
                bytes = f.read()
                b64 = base64.b64encode(bytes).decode()
                href = f"<a href=\"data:file/zip;base64,{b64}\" download='{zip_file_name}.zip'>\
                    DOWNLOAD PNP FILE(S)\
                </a>"

        except:
            pass


def main():
    mkt_list = ["MKT1", "MKT2", "MKT3", "MKT4"]

    mkt_selection = str(st.sidebar.selectbox("Select Market", mkt_list))

    st.sidebar.write(f"CIQ FILE FOR {mkt_selection}:")

    # File selection will be based on the market for this example the file is a demo
    file_selection = "demo_file.xlsx"
    st.sidebar.write(f"{file_selection}")

    ciq_xls = pd.ExcelFile(f"{file_selection}")
    ciq_df = pd.read_excel(ciq_xls, sheet_name=0)

    # There are two paths to follow, 1) select eNB, or select Cell ID, if you select eNB you can select several, if not you can only select one eNB but several Cell ID
    select_option = st.sidebar.selectbox("Select Option", ["eNB", "Cell ID"])

    if "eNB" == select_option:
        sid_list = list(ciq_df["eNB ID"].unique().tolist())
        sid_select = st.sidebar.multiselect("Site eNodeB", sid_list)
        st.dataframe(ciq_df.loc[ciq_df["eNB ID"].isin(sid_select)].astype(str))

    elif "Cell ID" == select_option:
        sid_list = list(ciq_df["eNB ID"].unique().tolist())
        sid_select = st.sidebar.selectbox("Site eNodeB", sid_list)
        cell_list = (
            ciq_df.loc[ciq_df["eNB ID"] == sid_select, "Cell ID"].unique().tolist()
        )
        cell_id_select = st.sidebar.multiselect("Cell ID", cell_list)
        st.dataframe(
            ciq_df.loc[
                (ciq_df["eNB ID"] == sid_select)
                & (ciq_df["Cell ID"].isin(cell_id_select))
            ].astype(str)
        )
        sid_select = [sid_select]

    st.sidebar.write("Select File to be generated:")
    # This are the three files that can be created, you can chose all three but at least have one selected.
    option_pnp = st.sidebar.checkbox("pnp", value=True)
    option_enb = st.sidebar.checkbox("enb", value=True)
    option_cell = st.sidebar.checkbox("cell", value=True)

    # once all the options have been selected i.e. Step1) Selecta a market, 2) select an option enb or cell id, and have at least one file to crate (pnp, enb, cell) you can click the 'CREATE PNP'
    create_button = st.button("CREATE PNP")

    if create_button and len(sid_select) > 0:
        st.write(f"STARTING PROCESS FOR SELECTED SITES: {sid_select}")
        for i in sid_select:
            st.write(f"BUILDING SITE: {i}")
            sid = str(i)

            if "eNB" == select_option:
                ciq_filter_sid_df = ciq_df.loc[(ciq_df["eNB ID"] == sid)].copy()
            else:
                ciq_filter_sid_df = ciq_df.loc[
                    (ciq_df["eNB ID"] == sid) & (ciq_df["Cell ID"].isin(cell_id_select))
                ].copy()

            # MY PROCESS GOES HERE WHERE I POPULATED A DICTIONARY (grow_cell_dict) THIS DICITONARY WILL GO TO THE write_dataframes_to_excel_sheet WHERE THE FILES (PNP, ENB, CELL) WILL BE PRODUCED.

            if not ciq_filter_sid_df.empty:
                grow_cell_dict = {"Test": "Test"}
                write_dataframes_to_excel_sheet(
                    mkt_selection,
                    grow_cell_dict,
                    sid,
                    file_selection,
                    option_pnp,
                    option_enb,
                    option_cell,
                )

        # Once the button is pressed we start the process


main()
