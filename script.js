// script.js

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR0HqnwgJkdwjTH2FI092uGK9-RsBfk-9OUGuQaAHhqbXHYtC2-PuVXwWI8JYQPVkCUSuaX1I_GHz-T/pub?output=csv';

let allData = [];
let groceryList = [];

// ========== Load CSV Data ==========
fetch(SHEET_CSV_URL)
  .then(res => res.text())
  .then(csv => {
    const [headerLine, ...lines] = csv.trim().split('\n');
    const headers = headerLine.split(',').map(h => h.trim());

    allData = lines.map(line => {
      const values = line.split(',');
      let entry = {};
      headers.forEach((h, i) => entry[h] = values[i]?.trim() || '');
      return entry;
    });

    renderComparison(allData);
    populateStoreDropdown();
  });

// ========== Tabs ==========
function showTab(tabId) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  const btn = [...document.querySelectorAll('.tab-button')].find(b => b.textContent.toLowerCase().includes(tabId.includes('comparison') ? 'comparison' : 'grocery'));
  if (btn) btn.classList.add('active');
}

// ========== Comparison ==========
function renderComparison(data) {
  const tbody = document.getElementById("comparisonResult");
  tbody.innerHTML = '';

  data.forEach(row => {
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

document.getElementById("comparisonSearch").addEventListener("input", function () {
  const q = this.value.toLowerCase();
  const filtered = allData.filter(r => r["Product Name"].toLowerCase().includes(q));
  renderComparison(filtered);
});

// ========== Store Dropdown ==========
function populateStoreDropdown() {
  const dropdown = document.getElementById("storeDropdown");
  const stores = [...new Set(allData.map(r => r["Store Name (Accurate Spelling)"]).filter(Boolean))];
  dropdown.innerHTML = '<option value="">-- Select Store --</option>';
  stores.forEach(store => {
    const opt = document.createElement("option");
    opt.value = store;
    opt.textContent = store;
    dropdown.appendChild(opt);
  });
}

// ========== Grocery List Tab ==========
function searchProduct() {
  const input = document.getElementById('searchInput');
  const keyword = input.value.trim().toLowerCase();
  const results = allData.filter(row => row["Product Name"].toLowerCase().includes(keyword));

  const suggestionTable = document.getElementById('suggestionTable');
  suggestionTable.innerHTML = '';

  if (results.length > 0) {
    document.getElementById('suggestionSection').classList.remove('hidden');
    results.forEach((row, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="checkbox" data-index="${index}" data-name="${row["Product Name"]}" data-brand="${row["Brand (Optional)"]}" data-weight="${row["Weight Number (Optional)"]} ${row["Weight (Optional)"]}"></td>
        <td>${row["Product Name"]}</td>
        <td>${row["Brand (Optional)"]}</td>
      `;
      suggestionTable.appendChild(tr);
    });
  } else {
    document.getElementById('suggestionSection').classList.add('hidden');
  }
}

function addSelectedToGroceryList() {
  const checkboxes = document.querySelectorAll('#suggestionTable input[type="checkbox"]:checked');
  checkboxes.forEach(cb => {
    const name = cb.dataset.name;
    const brand = cb.dataset.brand;
    const weight = cb.dataset.weight;
    if (!groceryList.some(item => item.name === name && item.brand === brand && item.weight === weight)) {
      groceryList.push({ name, brand, weight, qty: 1 });
    }
  });
  renderGroceryList();
  document.getElementById('suggestionSection').classList.add('hidden');
}

function renderGroceryList() {
  const tbody = document.getElementById("groceryListTable");
  const store = document.getElementById("storeDropdown").value;
  tbody.innerHTML = '';
  let total = 0;

  groceryList.forEach((item, index) => {
    const match = allData.find(r => r["Product Name"] === item.name && r["Brand (Optional)"] === item.brand && r["Store Name (Accurate Spelling)"] === store);
    let priceText = 'N/A';
    let priceVal = 0;

    if (match && match["Price (CAD)"]) {
      priceVal = parseFloat(match["Price (CAD)"]) * item.qty;
      priceText = `$${priceVal.toFixed(2)}`;
      total += priceVal;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.brand}</td>
      <td>${item.weight}</td>
      <td><input type="number" min="1" value="${item.qty}" onchange="updateQty(${index}, this.value)" /></td>
      <td>${priceText}</td>
      <td><button onclick="removeItem(${index})">Remove</button></td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("totalPrice").textContent = total.toFixed(2);
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
