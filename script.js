const API_URL = "https://api.sheetbest.com/sheets/478547a5-a8cd-41c0-83d4-089ac019697d";

let data = [];

// Load data
fetch(API_URL)
  .then(res => res.json())
  .then(json => {
    data = json;
    populateDropdowns();
  });

// ------------------- TAB SWITCHING -------------------
function showTab(tab) {
  document.getElementById("comparison").classList.add("hidden");
  document.getElementById("grocery").classList.add("hidden");
  document.getElementById(tab).classList.remove("hidden");
}

// ------------------- DROPDOWNS -------------------
function populateDropdowns() {
  const products = [...new Set(data.map(row => row["Product Name"]))];
  const stores = [...new Set(data.map(row => row["Store Name (Accurate Spelling)"]))];

  const comparisonProduct = document.getElementById("comparisonProduct");
  const groceryProducts = document.getElementById("groceryProducts");
  const storeSelect = document.getElementById("storeSelect");

  products.forEach(p => {
    comparisonProduct.add(new Option(p, p));
    groceryProducts.add(new Option(p, p));
  });

  stores.forEach(s => {
    storeSelect.add(new Option(s, s));
  });
}

// ------------------- COMPARISON TAB -------------------
function renderComparison() {
  const selectedProduct = document.getElementById("comparisonProduct").value;
  const table = document.getElementById("comparisonTable");
  table.innerHTML = "";

  data
    .filter(row => row["Product Name"] === selectedProduct)
    .forEach(row => {
      table.innerHTML += `
        <tr>
          <td>${row["Product Name"]}</td>
          <td>${row["Store Name (Accurate Spelling)"]}</td>
          <td>${row["Price (CAD)"]}</td>
        </tr>
      `;
    });
}

// ------------------- GROCERY LIST TAB -------------------
function renderGroceryList() {
  const store = document.getElementById("storeSelect").value;
  const products = [...document.getElementById("groceryProducts").selectedOptions]
    .map(o => o.value);

  const table = document.getElementById("groceryTable");
  table.innerHTML = "";

  let total = 0;

  data
    .filter(row =>
      row["Store Name (Accurate Spelling)"] === store &&
      products.includes(row["Product Name"])
    )
    .forEach(row => {
      const price = parseFloat(row["Price (CAD)"]) || 0;
      total += price;

      table.innerHTML += `
        <tr>
          <td>${row["Product Name"]}</td>
          <td>${price.toFixed(2)}</td>
        </tr>
      `;
    });

  document.getElementById("totalPrice").innerText = total.toFixed(2);
}
