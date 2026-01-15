const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0HqnwgJkdwjTH2FI092uGK9-RsBfk-9OUGuQaAHhqbXHYtC2-PuVXwWI8JYQPVkCUSuaX1I_GHz-T/pub?output=csv";

let allData = [];
let groceryList = [];

function showTab(tabId) {
  document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add("active");
}

fetch(CSV_URL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").map(r => r.split(","));
    const headers = rows[0];

    allData = rows.slice(1).map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h.trim()] = row[i]?.trim() || "");
      return obj;
    });

    populateStores();
    renderComparison(allData);
  });

function populateStores() {
  const stores = [...new Set(allData.map(r => r["Store Name (Accurate Spelling)"]))];
  const dropdown = document.getElementById("storeDropdown");
  dropdown.innerHTML = "<option value=''>Select Store</option>";
  stores.forEach(store => {
    const opt = document.createElement("option");
    opt.value = store;
    opt.textContent = store;
    dropdown.appendChild(opt);
  });
}

function renderComparison(data) {
  const body = document.getElementById("comparisonBody");
  body.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["Product Name"]}</td>
      <td>${row["Price (CAD)"]}</td>
      <td>${row["Store Name (Accurate Spelling)"]}</td>
      <td>${row["Brand (Optional)"]}</td>
      <td>${row["Category"]}</td>
    `;
    body.appendChild(tr);
  });
}

function filterComparison() {
  const q = document.getElementById("productSearch").value.toLowerCase();
  renderComparison(allData.filter(r => r["Product Name"].toLowerCase().includes(q)));
}

// MATCH TABLE BASED ON INPUT
const input = document.getElementById("productInput");
input.addEventListener("input", () => {
  const q = input.value.toLowerCase();
  const results = [...new Map(
    allData.filter(r => r["Product Name"].toLowerCase().includes(q))
      .map(item => [item["Product Name"] + item["Brand (Optional)"], item])
  ).values()];
  renderMatchTable(results);
});

function renderMatchTable(results) {
  const container = document.getElementById("matchResults");
  container.innerHTML = "";
  if (!results.length) return;

  const table = document.createElement("table");
  table.innerHTML = `
    <thead><tr><th>Product</th><th>Brand</th><th>Action</th></tr></thead>
    <tbody></tbody>
  `;

  results.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item["Product Name"]}</td>
      <td>${item["Brand (Optional)"]}</td>
      <td><button onclick='addToList(${JSON.stringify(item)})'>Add</button></td>
    `;
    table.querySelector("tbody").appendChild(tr);
  });

  container.appendChild(table);
}

function addToList(item) {
  groceryList.push({ ...item, quantity: 1 });
  document.getElementById("matchResults").innerHTML = "";
  document.getElementById("productInput").value = "";
  renderGroceryList();
}

function renderGroceryList() {
  const ul = document.getElementById("groceryList");
  const store = document.getElementById("storeDropdown").value;
  ul.innerHTML = "";
  let total = 0;

  groceryList.forEach((item, index) => {
    const match = allData.find(r =>
      r["Product Name"] === item["Product Name"] &&
      r["Brand (Optional)"] === item["Brand (Optional)"] &&
      r["Store Name (Accurate Spelling)"] === store
    );

    let priceText = "N/A";
    if (match && match["Price (CAD)"]) {
      const price = parseFloat(match["Price (CAD)"]) * item.quantity;
      total += price;
      priceText = `$${price.toFixed(2)}`;
    }

    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" checked>
      <div>
        <strong>${item["Product Name"]}</strong><br>
        <small>${item["Brand (Optional)"]} • ${item["Weight Number (Optional)"]} ${item["Weight (Optional)"]}</small><br>
        <small>${item["Store Name (Accurate Spelling)"]}</small>
      </div>
      <div class="right">
        Qty <input type="number" min="1" value="${item.quantity}" onchange="updateQty(${index}, this.value)">
        <div>${priceText}</div>
        <button onclick="removeItem(${index})">✕</button>
      </div>
    `;
    ul.appendChild(li);
  });

  document.getElementById("totalPrice").textContent = total.toFixed(2);
}

function updateQty(index, value) {
  groceryList[index].quantity = parseInt(value) || 1;
  renderGroceryList();
}

function removeItem(index) {
  groceryList.splice(index, 1);
  renderGroceryList();
}

function clearList() {
  groceryList = [];
  renderGroceryList();
}
