const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0HqnwgJkdwjTH2FI092uGK9-RsBfk-9OUGuQaAHhqbXHYtC2-PuVXwWI8JYQPVkCUSuaX1I_GHz-T/pub?output=csv";
let allData = [];
let groceryList = [];

async function loadCSVData() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const rows = text.split("\n").map(row => row.split(","));
  const headers = rows.shift();

  allData = rows.map(row => {
    const item = {};
    headers.forEach((header, i) => {
      item[header.trim()] = row[i]?.trim() || "";
    });
    return item;
  });

  renderComparisonTable();
  populateStoreDropdown();
}

// === Tab Switching ===
function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");

  document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
  const index = tabId === 'comparisonTab' ? 0 : 1;
  document.querySelectorAll(".tab-button")[index].classList.add("active");
}

// === Comparison Tab ===
function renderComparisonTable(filter = "") {
  const tbody = document.getElementById("comparisonResult");
  tbody.innerHTML = "";

  const filtered = allData.filter(item => item["Product Name"]?.toLowerCase().includes(filter.toLowerCase()));
  filtered.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["Product Name"]}</td>
      <td>${row["Brand (Optional)"]}</td>
      <td>${row["Weight Number (Optional)"]} ${row["Weight (Optional)"]}</td>
      <td>$${parseFloat(row["Price (CAD)"] || 0).toFixed(2)}</td>
      <td>${row["Store Name (Accurate Spelling)"]}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById("comparisonSearch").addEventListener("input", (e) => {
  renderComparisonTable(e.target.value);
});

// === Grocery List Tab ===
function searchProduct() {
  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  const suggestions = allData.filter(row =>
    row["Product Name"].toLowerCase().includes(input)
  );

  const table = document.getElementById("suggestionTable");
  table.innerHTML = "";

  suggestions.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" data-index="${allData.indexOf(row)}"></td>
      <td>${row["Product Name"]}</td>
      <td>${row["Brand (Optional)"]}</td>
    `;
    table.appendChild(tr);
  });

  document.getElementById("suggestionSection").classList.remove("hidden");
}

function addSelectedToGroceryList() {
  const checkboxes = document.querySelectorAll("#suggestionTable input[type='checkbox']:checked");
  checkboxes.forEach(cb => {
    const item = allData[cb.dataset.index];
    const exists = groceryList.some(p =>
      p["Product Name"] === item["Product Name"] &&
      p["Brand (Optional)"] === item["Brand (Optional)"]
    );
    if (!exists) groceryList.push(item);
  });

  renderGroceryList();
}

function populateStoreDropdown() {
  const dropdown = document.getElementById("storeDropdown");
  const stores = [...new Set(allData.map(r => r["Store Name (Accurate Spelling)"]))].sort();
  dropdown.innerHTML = stores.map(store => `<option value="${store}">${store}</option>`).join("");
  renderGroceryList();
}

function renderGroceryList() {
  const store = document.getElementById("storeDropdown").value;
  const table = document.getElementById("groceryListTable");
  table.innerHTML = "";
  let total = 0;

  groceryList.forEach((item, idx) => {
    const match = allData.find(p =>
      p["Product Name"] === item["Product Name"] &&
      p["Brand (Optional)"] === item["Brand (Optional)"] &&
      p["Store Name (Accurate Spelling)"] === store
    );

    const qty = 1;
    const price = match ? parseFloat(match["Price (CAD)"]) : 0;
    const subtotal = match ? price * qty : 0;
    if (match) total += subtotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item["Product Name"]}</td>
      <td>${item["Brand (Optional)"]}</td>
      <td>${match ? match["Weight Number (Optional)"] + " " + match["Weight (Optional)"] : "N/A"}</td>
      <td>${qty}</td>
      <td>${match ? `$${price.toFixed(2)}` : "N/A"}</td>
      <td><button class="remove-btn" onclick="removeFromGroceryList(${idx})">X</button></td>
    `;
    table.appendChild(tr);
  });

  document.getElementById("totalPrice").textContent = total.toFixed(2);
}

function removeFromGroceryList(index) {
  groceryList.splice(index, 1);
  renderGroceryList();
}

function clearGroceryList() {
  groceryList = [];
  renderGroceryList();
}

// === Init ===
window.onload = () => {
  loadCSVData();
};
