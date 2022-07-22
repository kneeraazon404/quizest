
function selectMarket() {
  const market = document.getElementById("market_selected");
  const market_selected = document.getElementById("selected_market");
  const ExcelFileName = document.getElementById("ExcelFileName");
  market_selected.innerHTML = "CIQ FILE FOR  " + market.value;
  ExcelFileName.innerHTML = "example.xlsx";
}
function selectOption() {
  const option_sel = document.getElementById("select_option");
  const site_node = document.getElementById("site_node");
  console.log(option_sel.value);
  if (option_sel.value == 2)
  {
    site_node.setAttribute("multiple", "multiple");
  } else if (option_sel.value == 1)
  {
    site_node.removeAttribute("multiple");
  }
  const select_option = document.getElementById("select_option");
  if (select_option.value == 1)
  {
    const cell_id = document.getElementById("cell_id");
    cell_id.style.display = "block";
  }
  else
  {
    const cell_id = document.getElementById("cell_id");
    cell_id.style.display = cell_id.style.display === 'none' ? '' : 'none';
  }
}


function showDownload() {
  const download = document.getElementById("download");
  download.style.display = "block";
  window.scrollTo(0, 100);
}


