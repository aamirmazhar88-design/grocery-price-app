const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0HqnwgJkdwjTH2FI092uGK9-RsBfk-9OUGuQaAHhqbXHYtC2-PuVXwWI8JYQPVkCUSuaX1I_GHz-T/pub?output=csv";

let allData = [];
let groceryList = [];

// Load CSV on start
fetch(CSV_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").map(row => row.split(","));
    const headers = rows[0];

    allData = rows.slice(1).map(row => {
      const item = {};
      headers.forEach((header, i) => {
        item[header.trim()] = row[i]?.trim() || "";
      });
      return item;
    });

    renderComparison(allData);
    populateStoreDropdown();
  });

// Tab switching
function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add("active");
}

// Render comparison table
function renderComparison(data) {
  const tbody = document.querySelector("#comparisonTable tbody");
  tbody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["Product Name"]}</td>
      <td>${row["Brand (Optional)"]}</td>
      <td>${row["Weight (Optional)"]}</td>
      <td>${row["Price (CAD)"]}</td>
      <td>${row["Store Name (Accurate Spelling)"]}</td>
      <td>${row["Category"]}</td>
    `;
    tbody.appendChild(tr);
  });
}

function filterComparison() {
  const q = document.getElementById("comparisonSearch").value.toLowerCase();
  const filtered = allData.filter(row => row["Product Name"]?.toLowerCase().includes(q));
  renderComparison(filtered);
}

// Grocery List Logic
function populateStoreDropdown() {
  const dropdown = document.getElementById("storeDropdown");
  const stores = [...new Set(allData.map(row => row["Store Name (Accurate Spelling)"]))].filter(Boolean);
  dropdown.innerHTML = stores.map(s => `<option value="${s}">${s}</option>`).join("");
}

function searchSuggestions() {
  const input = document.getElementById("productInput").value.trim().toLowerCase();
  const suggestionsContainer = document.getElementById("suggestionsContainer");
  suggestionsContainer.innerHTML = "";

  if (!input) return;

  const matches = allData.filter(row => row["Product Name"].toLowerCase().includes(input));
  if (matches.length === 0) {
    suggestionsContainer.innerHTML = `<p>No matches found.</p>`;
    return;
  }

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  thead.innerHTML = `<tr><th>Product</th><th>Brand</th><th>Select</th></tr>`;
  matches.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["Product Name"]}</td>
      <td>${row["Brand (Optional)"]}</td>
      <td><button onclick="addToGroceryList('${row["Product Name"].replace(/'/g, "\\'")}', '${row["Brand (Optional)"].replace(/'/g, "\\'")}', '${row["Weight (Optional)"]}')">Add</button></td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  suggestionsContainer.appendChild(table);
}

function addToGroceryList(productName, brand, weight) {
  const exists = groceryList.some(item => item.name === productName && item.brand === brand && item.weight === weight);
  if (!exists) {
    groceryList.push({ name: productName, brand, weight, qty: 1 });
    renderGroceryList();
  }
}

function renderGroceryList() {
  const store = document.getElementById("storeDropdown").value;
  const tbody = document.getElementById("groceryListBody");
  const totalElem = document.getElementById("totalPrice");
  tbody.innerHTML = "";
  let total = 0;

  groceryList.forEach((item, index) => {
    const entry = allData.find(row => row["Product Name"] === item.name && row["Brand (Optional)"] === item.brand && row["Weight (Optional)"] === item.weight && row["Store Name (Accurate Spelling)"] === store);

    let priceDisplay = "N/A";
    if (entry && entry["Price (CAD)"]) {
      const price = parseFloat(entry["Price (CAD)"]) * item.qty;
      priceDisplay = `$${price.toFixed(2)}`;
      total += price;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.brand}</td>
      <td>${item.weight}</td>
      <td><input type="number" min="1" value="${item.qty}" onchange="updateQty(${index}, this.value)" /></td>
      <td>${priceDisplay}</td>
      <td><button class="remove-btn" onclick="removeItem(${index})">Remove</button></td>
    `;
    tbody.appendChild(tr);
  });

  totalElem.textContent = total.toFixed(2);
}

function updateQty(index, value) {
  groceryList[index].qty = parseInt(value) || 1;
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
