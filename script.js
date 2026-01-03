document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR0HqnwgJkdwjTH2FI092uGK9-RsBfk-9OUGuQaAHhqbXHYtC2-PuVXwWI8JYQPVkCUSuaX1I_GHz-T/pub?output=csv';

  let apiData = [];

  fetch(csvUrl)
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n').map(row => row.split(','));
      const headers = rows[0];
      const entries = rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, i) => {
          obj[header.trim()] = row[i] ? row[i].trim() : '';
        });
        return obj;
      });
      apiData = entries;

      renderComparison(entries);
      populateStoreDropdown(entries);
    })
    .catch(error => console.error('Error loading CSV:', error));

  function renderComparison(entries) {
    const comparisonTable = document.getElementById("comparisonTable").getElementsByTagName("tbody")[0];
    comparisonTable.innerHTML = "";

    entries.forEach(entry => {
      const row = comparisonTable.insertRow();
      row.innerHTML = `
        <td>${entry["Category"] || ""}</td>
        <td>${entry["Product Name"] || ""}</td>
        <td>${entry["Brand (Optional)"] || ""}</td>
        <td>${entry["Weight Number (Optional)"] || ""} ${entry["Weight (Optional)"] || ""}</td>
        <td>${entry["Price (CAD)"] ? `$${parseFloat(entry["Price (CAD)"]).toFixed(2)}` : ""}</td>
        <td>${entry["Store Name (Accurate Spelling)"] || ""}</td>
        <td>${entry["Store Location (Optional)"] || ""}</td>
      `;
    });
  }

  function populateStoreDropdown(entries) {
    const selector = document.getElementById("storeSelector");
    const stores = [...new Set(entries.map(e => e["Store Name (Accurate Spelling)"]).filter(Boolean))];

    stores.forEach(store => {
      const option = document.createElement("option");
      option.value = store;
      option.textContent = store;
      selector.appendChild(option);
    });
  }

  document.getElementById("addGroceryBtn").addEventListener("click", () => {
    addToGroceryList(apiData);
  });
});

function addToGroceryList(apiData) {
  const productInput = document.getElementById("groceryInput").value.trim();
  const quantity = parseInt(document.getElementById("quantityInput").value) || 1;
  const selectedStore = document.getElementById("storeSelector").value;
  const table = document.getElementById("groceryListTable").getElementsByTagName("tbody")[0];

  if (!productInput) return;

  const matchingItems = apiData.filter(
    (item) =>
      item["Product Name"] &&
      item["Product Name"].toLowerCase() === productInput.toLowerCase()
  );

  let productData = {
    Product: productInput,
    Brand: "N/A",
    Weight: "N/A",
    Unit: "N/A",
    Price: "N/A"
  };

  for (let item of matchingItems) {
    if (
      item["Store Name (Accurate Spelling)"] &&
      item["Store Name (Accurate Spelling)"].toLowerCase() === selectedStore.toLowerCase()
    ) {
      productData = {
        Product: item["Product Name"] || productInput,
        Brand: item["Brand (Optional)"] || "N/A",
        Weight: item["Weight Number (Optional)"] || "N/A",
        Unit: item["Weight (Optional)"] || "N/A",
        Price: parseFloat(item["Price (CAD)"]) || "N/A"
      };
      break;
    }
  }

  const totalPrice =
    productData.Price !== "N/A" ? (productData.Price * quantity).toFixed(2) : "N/A";

  const row = table.insertRow();
  row.innerHTML = `
    <td>${productData.Product}</td>
    <td>${productData.Brand}</td>
    <td>${productData.Weight}</td>
    <td>${productData.Unit}</td>
    <td>${productData.Price !== "N/A" ? "$" + productData.Price.toFixed(2) : "N/A"}</td>
    <td>${quantity}</td>
    <td>${totalPrice !== "N/A" ? "$" + totalPrice : "N/A"}</td>
  `;

  updateGroceryTotal();
}

function updateGroceryTotal() {
  const table = document.getElementById("groceryListTable").getElementsByTagName("tbody")[0];
  let total = 0;

  for (let row of table.rows) {
    const totalCell = row.cells[6].innerText;
    if (totalCell !== "N/A") {
      total += parseFloat(totalCell.replace("$", ""));
    }
  }

  document.getElementById("groceryTotal").innerText = `Total: $${total.toFixed(2)}`;
}
