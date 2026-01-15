const apiURL = "https://api.sheetbest.com/sheets/478547a5-a8cd-41c0-83d4-089ac019697d";
let allData = [];
let groceryList = [];

// Fetch data from API
function fetchData() {
  fetch(apiURL)
    .then((response) => response.json())
    .then((data) => {
      allData = data;
      displayComparison(data);
      populateStoreDropdown(data);
    });
}

function displayComparison(data) {
  const tbody = document.querySelector("#comparisonTable tbody");
  tbody.innerHTML = "";
  data.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["Product Name"]}</td>
      <td>${row["Price (CAD)"]}</td>
      <td>${row["Store Name (Accurate Spelling)"]}</td>
      <td>${row["Brand (Optional)"]}</td>
      <td>${row["Category"]}</td>
    `;
    tbody.appendChild(tr);
  });
}

function filterComparison() {
  const query = document.getElementById("productSearch").value.toLowerCase();
  const filtered = allData.filter((row) =>
    row["Product Name"]?.toLowerCase().includes(query)
  );
  displayComparison(filtered);
}

function populateStoreDropdown(data) {
  const storeDropdown = document.getElementById("storeDropdown");
  const stores = [...new Set(data.map((row) => row["Store Name (Accurate Spelling)"]).filter(Boolean))];

  storeDropdown.innerHTML = '<option value="">Select Store</option>';
  stores.forEach((store) => {
    const option = document.createElement("option");
    option.value = store;
    option.textContent = store;
    storeDropdown.appendChild(option);
  });
}

function renderMatches(productName) {
  const matchTable = document.getElementById("matchTable");
  matchTable.innerHTML = "";

  const matches = allData.filter((row) =>
    row["Product Name"].toLowerCase().includes(productName.toLowerCase())
  );

  if (matches.length === 0) {
    matchTable.innerHTML = "<p>No matches found.</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Select</th>
        <th>Product Name</th>
        <th>Brand</th>
      </tr>
    </thead>
    <tbody>
      ${matches
        .map(
          (match, index) => `
        <tr>
          <td><input type="radio" name="matchSelect" value="${index}" /></td>
          <td>${match["Product Name"]}</td>
          <td>${match["Brand (Optional)"] || "-"}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  matchTable.appendChild(table);

  // Store match data temporarily
  window.currentMatches = matches;
}

function confirmSelection() {
  const selected = document.querySelector("input[name='matchSelect']:checked");
  if (!selected || !window.currentMatches) return;

  const match = window.currentMatches[selected.value];
  groceryList.push({ ...match, qty: 1 });
  renderGroceryList();

  // Clear fields
  document.getElementById("productAdd").value = "";
  document.getElementById("matchTable").innerHTML = "";
}

function renderGroceryList() {
  const listTable = document.getElementById("groceryListTable");
  const selectedStore = document.getElementById("storeDropdown").value;

  let total = 0;
  let html = `
    <thead>
      <tr>
        <th>✓</th>
        <th>Product</th>
        <th>Details</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Remove</th>
      </tr>
    </thead>
    <tbody>
  `;

  groceryList.forEach((item, index) => {
    const match = allData.find(
      (row) =>
        row["Product Name"].toLowerCase() === item["Product Name"].toLowerCase() &&
        row["Brand (Optional)"] === item["Brand (Optional)"] &&
        row["Store Name (Accurate Spelling)"] === selectedStore
    );

    const price = match ? parseFloat(match["Price (CAD)"]) : null;
    const weight = match ? `${match["Weight Number (Optional)"] || ""} ${match["Weight (Optional)"] || ""}`.trim() : "";

    if (price) total += price * item.qty;

    html += `
      <tr>
        <td><input type="checkbox" checked /></td>
        <td><strong>${item["Product Name"]}</strong><br>${item["Brand (Optional)"] || ""}</td>
        <td>${weight || "-"}</td>
        <td><input type="number" min="1" value="${item.qty}" onchange="updateQty(${index}, this.value)" /></td>
        <td>${price ? `$${(price * item.qty).toFixed(2)}` : '<span class="price-na">N/A</span>'}</td>
        <td><button class="remove-btn" onclick="removeItem(${index})">×</button></td>
      </tr>
    `;
  });

  html += `</tbody>`;
  listTable.innerHTML = html;

  document.getElementById("totalAmount").textContent = `$${total.toFixed(2)}`;
}

function updateQty(index, value) {
  groceryList[index].qty = parseInt(value);
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

// Tab switching
function showTab(tabId) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");

  document.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"));
  document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add("active");
}

// Event listeners
fetchData();
