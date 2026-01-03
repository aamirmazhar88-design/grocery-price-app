const apiUrl = "https://api.sheetbest.com/sheets/478547a5-a8cd-41c0-83d4-089ac019697d";

async function fetchData() {
  const res = await fetch(apiUrl);
  const data = await res.json();
  return data;
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
}

function renderComparison(data) {
  const target = document.getElementById("comparison");
  let html = "<table border='1'><tr><th>Product</th><th>Store</th><th>Price</th></tr>";
  data.forEach(row => {
    html += `<tr><td>${row.Product}</td><td>${row.Store}</td><td>${row.Price}</td></tr>`;
  });
  html += "</table>";
  target.innerHTML = html;
}

function renderGroceryList(data) {
  const target = document.getElementById("list");
  let html = "<ul>";
  data.forEach(row => {
    if (row.Selected === "Yes") {
      html += `<li>${row.Product} - ${row.Store} - ${row.Price}</li>`;
    }
  });
  html += "</ul>";
  target.innerHTML = html;
}

fetchData().then(data => {
  renderComparison(data);
  renderGroceryList(data);
});
