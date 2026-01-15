const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0HqnwgJkdwjTH2FI092uGK9-RsBfk-9OUGuQaAHhqbXHYtC2-PuVXwWI8JYQPVkCUSuaX1I_GHz-T/pub?output=csv";
let allData = [];
let groceryList = [];

function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");

  document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
  const tabButton = Array.from(document.querySelectorAll(".tab-button")).find(btn => btn.textContent.toLowerCase().includes(tabId.replace("Tab", "").toLowerCase()));
  if (tabButton) tabButton.classList.add("active");
}

function fetchCSVData() {
  fetch(csvUrl)
    .then(response => response.text())
    .then(data => {
      const [headerLine, ...lines] = data.trim().split("\n");
      const headers = headerLine.split(",");
      allData = lines.map(line => {
        const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
        const obj = {};
        headers.forEach((header, i) => obj[header.trim()] = values[i]?.trim().replace(/^"|"$/g, ""));
        return obj;
      });
      populateComparison();
      populateStoreDropdown();
    });
}

function populateComparison() {
  const tbody = document.getElementById("comparisonResult");
  tbody.innerHTML = "";
  allData.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["Product Name"]}</td>
      <td>${row["Brand (Optional)"] || ""}</td>
      <td>${row["Weight Number (Optional)"] || ""} ${row["Weight (Optional)"] || ""}</td>
      <td>$${parseFloat(row["Price (CAD)"] || 0).toFixed(2)}</td>
      <td>${row["Store Name (Accurate Spelling)"]}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById("comparisonSearch").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const filtered = allData.filter(row => row["Product Name"]?.toLowerCase().includes(query));
  const tbody = document.getElementById("comparisonResult");
  tbody.innerHTML = "";
  filtered.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["Product Name"]}</td>
      <td>${row["Brand (Optional)"] || ""}</td>
      <td>${row["Weight Number (Optional)"] || ""} ${row["Weight (Optional)"] || ""}</td>
      <td>$${parseFloat(row["Price (CAD)"] || 0).toFixed(2)}</td>
      <td>${row["Store Name (Accurate Spelling)"]}</td>
    `;
    tbody.appendChild(tr);
  });
});

function searchProduct() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allData.filter(row => row["Product Name"].toLowerCase().includes(query));

  const uniqueProducts = new Map();
  filtered.forEach(row => {
    const key = `${row["Product Name"]}_${row["Brand (Optional)"]}`;
    if (!uniqueProducts.has(key)) uniqueProducts.set(key, row);
  });

  const table = document.getElementById("suggestionTable");
  table.innerHTML = "";
  uniqueProducts.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" data-product='${JSON.stringify(row)}' /></td>
      <td>${row["Product Name"]}</td>
      <td>${row["Brand (Optional)"] || ""}</td>
    `;
    table.appendChild(tr);
  });
  document.getElementById("suggestionSection").classList.remove("hidden");
}

function addSelectedToGroceryList() {
  document.querySelectorAll("#suggestionTable input[type=checkbox]:checked").forEach(input => {
    const product = JSON.parse(input.getAttribute("data-product"));
    groceryList.push(product);
  });
  renderGroceryList();
  document.getElementById("suggestionSection").classList.add("hidden");
}

function populateStoreDropdown() {
  const storeDropdown = document.getElementById("storeDropdown");
  const stores = [...new Set(allData.map(row => row["Store Name (Accurate Spelling)"]).filter(Boolean))].sort();
  storeDropdown.innerHTML = `<option value="">Select Store</option>`;
  stores.forEach(store => {
    const option = document.createElement("option");
    option.value = store;
    option.textContent = store;
    storeDropdown.appendChild(option);
  });
}

function renderGroceryList() {
  const store = document.getElementById("storeDropdown").value;
  const tbody = document.getElementById("groceryListTable");
  const totalElement = document.getElementById("totalPrice");
  let total = 0;
  tbody.innerHTML = "";

  groceryList.forEach((item, index) => {
    const qty = item.qty || 1;
    const match = allData.find(row =>
      row["Product Name"] === item["Product Name"] &&
      row["Brand (Optional)"] === item["Brand (Optional)"] &&
      row["Store Name (Accurate Spelling)"] === store
    );

    const price = match ? parseFloat(match["Price (CAD)"]) : null;
    const weight = match ? `${match["Weight Number (Optional)"] || ""} ${match["Weight (Optional)"] || ""}` : "";

    if (price) total += price * qty;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item["Product Name"]}</td>
      <td>${item["Brand (Optional)"] || ""}</td>
      <td>${weight}</td>
      <td><input type="number" min="1" value="${qty}" onchange="updateQty(${index}, this.value)" /></td>
      <td>${price ? `$${price.toFixed(2)}` : "N/A"}</td>
      <td><button onclick="removeItem(${index})">Remove</button></td>
    `;
    tbody.appendChild(tr);
  });
  totalElement.textContent = total.toFixed(2);
}

function updateQty(index, value) {
  groceryList[index].qty = parseInt(value);
  renderGroceryList();
}

function removeItem(index) {
  groceryList.splice(index, 1);
  renderGroceryList();
}

function clearGroceryList() {
  groceryList = [];
  renderGroceryList();
}

fetchCSVData();
