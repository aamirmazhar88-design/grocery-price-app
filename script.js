const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0HqnwgJkdwjTH2FI092uGK9-RsBfk-9OUGuQaAHhqbXHYtC2-PuVXwWI8JYQPVkCUSuaX1I_GHz-T/pub?output=csv";

let allData = [];
let groceryItems = [];

/* ================= TAB SWITCH ================= */
function showTab(tabId) {
  document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add("active");
}

/* ================= LOAD CSV ================= */
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

/* ================= STORES ================= */
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

/* ================= COMPARISON ================= */
function renderComparison(data) {
  const body = document.getElementById("comparisonBody");
  body.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["Product Name"]}</td>
      <td>${row["Brand (Optional)"]}</td>
      <td>${row["Weight Number (Optional)"]} ${row["Weight (Optional)"]}</td>
      <td>$${row["Price (CAD)"]}</td>
      <td>${row["Store Name (Accurate Spelling)"]}</td>
    `;
    body.appendChild(tr);
  });
}

function filterComparison() {
  const q = document.getElementById("productSearch").value.toLowerCase();
  renderComparison(allData.filter(r =>
    r["Product Name"].toLowerCase().includes(q)
  ));
}

/* ================= MATCHING TABLE ================= */
document.getElementById("productInput").addEventListener("input", () => {
  const query = document.getElementById("productInput").value.toLowerCase();
  const store = document.getElementById("storeDropdown").value;
  const results = allData.filter(r =>
    r["Product Name"].toLowerCase().includes(query) &&
    (!store || r["Store Name (Accurate Spelling)"] === store)
  );
  renderMatches(results);
});

function renderMatches(results) {
  const container = document.getElementById("matchResults");
  container.innerHTML = "";

  if (!results.length) return;

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Product</th>
        <th>Brand</th>
        <th>Weight</th>
        <th>Price</th>
        <th></th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  results.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item["Product Name"]}</td>
      <td>${item["Brand (Optional)"]}</td>
      <td>${item["Weight Number (Optional)"]} ${item["Weight (Optional)"]}</td>
      <td>$${item["Price (CAD)"]}</td>
      <td><button onclick='addToList(${JSON.stringify(item)})'>Add</button></td>
    `;
    table.querySelector("tbody").appendChild(tr);
  });

  container.appendChild(table);
}

/* ================= CHECKLIST ================= */
function addToList(item) {
  groceryItems.push({
    ...item,
    qty: 1
  });
  document.getElementById("matchResults").innerHTML = "";
  document.getElementById("productInput").value = "";
  renderGroceryList();
}

function renderGroceryList() {
  const ul = document.getElementById("groceryList");
  ul.innerHTML = "";
  let total = 0;

  groceryItems.forEach((item, index) => {
    const price = parseFloat(item["Price (CAD)"]) * item.qty;
    total += price;

    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" checked>
      <div>
        <strong>${item["Product Name"]}</strong><br>
        <small>${item["Brand (Optional)"]} • ${item["Weight Number (Optional)"]} ${item["Weight (Optional)"]}</small><br>
        <small>${item["Store Name (Accurate Spelling)"]}</small>
      </div>
      <div class="right">
        Qty <input type="number" min="1" value="${item.qty}"
          onchange="updateQty(${index}, this.value)">
        <div>$${price.toFixed(2)}</div>
        <button onclick="removeItem(${index})">✕</button>
      </div>
    `;
    ul.appendChild(li);
  });

  document.getElementById("totalPrice").textContent = total.toFixed(2);
}

function updateQty(index, value) {
  groceryItems[index].qty = parseInt(value) || 1;
  renderGroceryList();
}

function removeItem(index) {
  groceryItems.splice(index, 1);
  renderGroceryList();
}

function clearList() {
  groceryItems = [];
  renderGroceryList();
}
