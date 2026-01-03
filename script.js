const sheetURL = "https://api.sheetbest.com/sheets/478547a5-a8cd-41c0-83d4-089ac019697d";
let allData = [];

function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
}

function fetchSheetData() {
  fetch(sheetURL)
    .then(res => res.json())
    .then(data => {
      allData = data;
    });
}

// Data Entry Submission
function submitData() {
  const data = {
    "Category": document.getElementById("category").value,
    "Product": document.getElementById("product").value,
    "Brand (Optional)": document.getElementById("brand").value,
    "Weight (Optional)": document.getElementById("weight").value,
    "LB or KG (Optional)": document.getElementById("unit").value,
    "Price (Include VAT)": document.getElementById("price").value,
    "Store Name": document.getElementById("store").value,
    "Store Location (Optional)": document.getElementById("location").value
  };

  fetch(sheetURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(() => {
    alert("Data submitted!");
    document.querySelectorAll("#entry input, #entry select").forEach(el => el.value = "");
    fetchSheetData(); // refresh data
  });
}

// Comparison
function comparePrices() {
  const query = document.getElementById("compareInput").value.toLowerCase();
  const results = allData.filter(row =>
    row["Product"]?.toLowerCase().includes(query)
  );

  const container = document.getElementById("comparisonResults");
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = "<p>No results found.</p>";
    return;
  }

  const table = document.createElement("table");
  const headers = `
    <tr>
      <th>Product</th>
      <th>Brand</th>
      <th>Weight</th>
      <th>Unit</th>
      <th>Price (Include VAT)</th>
      <th>Store</th>
      <th>Location</th>
      <th>Category</th>
    </tr>`;
  table.innerHTML = headers;

  results.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["Product"] || ""}</td>
      <td>${row["Brand (Optional)"] || ""}</td>
      <td>${row["Weight (Optional)"] || ""}</td>
      <td>${row["LB or KG (Optional)"] || ""}</td>
      <td>${row["Price (Include VAT)"] || ""}</td>
      <td>${row["Store Name"] || ""}</td>
      <td>${row["Store Location (Optional)"] || ""}</td>
      <td>${row["Category"] || ""}</td>
    `;
    table.appendChild(tr);
  });

  container.appendChild(table);
}

// Grocery List
function addToList() {
  const query = document.getElementById("listInput").value.toLowerCase();
  const results = allData.filter(row =>
    row["Product"]?.toLowerCase().includes(query)
  );

  const container = document.getElementById("groceryListResults");
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = "<p>No matching items found.</p>";
    return;
  }

  const table = document.createElement("table");
  const headers = `
    <tr>
      <th>Product</th>
      <th>Brand</th>
      <th>Weight</th>
      <th>Unit</th>
      <th>Price</th>
      <th>Store</th>
    </tr>`;
  table.innerHTML = headers;

  results.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row["Product"] || ""}</td>
      <td>${row["Brand (Optional)"] || ""}</td>
      <td>${row["Weight (Optional)"] || ""}</td>
      <td>${row["LB or KG (Optional)"] || ""}</td>
      <td>${row["Price (Include VAT)"] || ""}</td>
      <td>${row["Store Name"] || ""}</td>
    `;
    table.appendChild(tr);
  });

  container.appendChild(table);
}

fetchSheetData();
