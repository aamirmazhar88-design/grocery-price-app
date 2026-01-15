document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR0HqnwgJkdwjTH2FI092uGK9-RsBfk-9OUGuQaAHhqbXHYtC2-PuVXwWI8JYQPVkCUSuaX1I_GHz-T/pub?output=csv';

  let allData = [];
  let groceryList = [];

  const storeDropdown = document.getElementById('storeDropdown');
  const comparisonBody = document.getElementById('comparisonBody');
  const suggestionContainer = document.getElementById('suggestions');
  const groceryTable = document.getElementById('groceryTableBody');
  const totalPriceElement = document.getElementById('totalPrice');

  fetch(csvUrl)
    .then(res => res.text())
    .then(text => {
      const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
      const headers = rows[0];
      allData = rows.slice(1).map(row => {
        let entry = {};
        headers.forEach((header, i) => entry[header] = row[i] || '');
        return entry;
      });
      renderComparisonTable(allData);
      populateStoreDropdown();
    });

  function renderComparisonTable(data) {
    comparisonBody.innerHTML = '';
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row['Product Name']}</td>
        <td>${row['Price (CAD)']}</td>
        <td>${row['Store Name (Accurate Spelling)']}</td>
        <td>${row['Brand (Optional)']}</td>
        <td>${row['Category']}</td>
      `;
      comparisonBody.appendChild(tr);
    });
  }

  document.getElementById('productSearch').addEventListener('input', () => {
    const query = document.getElementById('productSearch').value.toLowerCase();
    const filtered = allData.filter(row => row['Product Name'].toLowerCase().includes(query));
    renderComparisonTable(filtered);
  });

  function populateStoreDropdown() {
    const stores = [...new Set(allData.map(r => r['Store Name (Accurate Spelling)']).filter(Boolean))];
    storeDropdown.innerHTML = '<option value="">Select Store</option>';
    stores.forEach(store => {
      const opt = document.createElement('option');
      opt.value = store;
      opt.textContent = store;
      storeDropdown.appendChild(opt);
    });
    storeDropdown.addEventListener('change', updateGroceryDisplay);
  }

  document.getElementById('addProductBtn').addEventListener('click', () => {
    const input = document.getElementById('productInput');
    const term = input.value.trim().toLowerCase();
    if (!term) return;

    const matches = allData.filter(row => row['Product Name'].toLowerCase().includes(term));

    suggestionContainer.innerHTML = '';
    if (matches.length) {
      const table = document.createElement('table');
      table.className = 'grocery-table';
      const tbody = document.createElement('tbody');
      matches.forEach((match, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${match['Product Name']}</strong></td>
          <td>${match['Brand (Optional)'] || '-'}</td>
          <td><button onclick="selectSuggestion(${idx})">Add</button></td>
        `;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      suggestionContainer.appendChild(table);
    }
  });

  window.selectSuggestion = (index) => {
    const match = allData.filter(row => row['Product Name'].toLowerCase().includes(document.getElementById('productInput').value.trim().toLowerCase()))[index];
    if (!groceryList.find(item => item.name === match['Product Name'] && item.brand === match['Brand (Optional)'])) {
      groceryList.push({
        name: match['Product Name'],
        brand: match['Brand (Optional)'],
        qty: 1
      });
      updateGroceryDisplay();
    }
    document.getElementById('productInput').value = '';
    suggestionContainer.innerHTML = '';
  }

  function updateGroceryDisplay() {
    const store = storeDropdown.value;
    groceryTable.innerHTML = '';
    let total = 0;

    groceryList.forEach((item, i) => {
      const match = allData.find(row =>
        row['Product Name'] === item.name &&
        row['Brand (Optional)'] === item.brand &&
        row['Store Name (Accurate Spelling)'] === store
      );

      let priceText = 'N/A';
      let price = 0;
      if (match && match['Price (CAD)']) {
        price = parseFloat(match['Price (CAD)']) * item.qty;
        priceText = `$${price.toFixed(2)}`;
        total += price;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.name}</strong><br>${item.brand || ''}</td>
        <td><input type="number" value="${item.qty}" min="1" onchange="updateQty(${i}, this.value)"/></td>
        <td>${priceText}</td>
        <td><button class="remove-btn" onclick="removeItem(${i})">×</button></td>
      `;
      groceryTable.appendChild(tr);
    });

    totalPriceElement.textContent = `$${total.toFixed(2)}`;
  }

  window.updateQty = (i, val) => {
    groceryList[i].qty = parseInt(val);
    updateGroceryDisplay();
  };

  window.removeItem = (i) => {
    groceryList.splice(i, 1);
    updateGroceryDisplay();
  };

  window.clearGroceryList = () => {
    groceryList = [];
    updateGroceryDisplay();
  };
});
