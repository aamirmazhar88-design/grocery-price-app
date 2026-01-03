document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR0HqnwgJkdwjTH2FI092uGK9-RsBfk-9OUGuQaAHhqbXHYtC2-PuVXwWI8JYQPVkCUSuaX1I_GHz-T/pub?output=csv';

  let groceryData = [];
  let groceryList = [];

  const storeDropdown = document.getElementById('storeDropdown');
  const groceryListItems = document.getElementById('groceryListItems');
  const totalPriceElement = document.getElementById('totalPrice');
  const clearListBtn = document.getElementById('clearListBtn');

  // Load CSV
  fetch(csvUrl)
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n').map(row => row.split(',').map(cell => cell.trim()));
      const headers = rows[0];
      const entries = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i] || '';
        });
        return obj;
      });
      groceryData = entries;

      populateStoreDropdown();
    })
    .catch(error => console.error('Error loading CSV:', error));

  function populateStoreDropdown() {
    const storeSet = new Set(groceryData.map(entry => entry['Store Name (Accurate Spelling)']));
    storeDropdown.innerHTML = '';
    storeSet.forEach(store => {
      const option = document.createElement('option');
      option.value = store;
      option.textContent = store;
      storeDropdown.appendChild(option);
    });
    storeDropdown.addEventListener('change', updateGroceryDisplay);
  }

  // Add product
  document.getElementById('addProductBtn').addEventListener('click', () => {
    const input = document.getElementById('productInput');
    const name = input.value.trim().toLowerCase();
    if (name) {
      if (!groceryList.some(item => item.name === name)) {
        groceryList.push({ name, quantity: 1 });
        updateGroceryDisplay();
      }
      input.value = '';
    }
  });

  // Clear list
  clearListBtn.addEventListener('click', () => {
    groceryList = [];
    updateGroceryDisplay();
  });

  function updateGroceryDisplay() {
    const selectedStore = storeDropdown.value;
    groceryListItems.innerHTML = '';
    let total = 0;

    groceryList.forEach((item, index) => {
      const entry = groceryData.find(
        e => e['Product Name']?.toLowerCase() === item.name && e['Store Name (Accurate Spelling)'] === selectedStore
      );

      const li = document.createElement('li');

      const nameSpan = document.createElement('span');
      nameSpan.textContent = item.name.charAt(0).toUpperCase() + item.name.slice(1) + ' - ';

      const quantityInput = document.createElement('input');
      quantityInput.type = 'number';
      quantityInput.min = '1';
      quantityInput.value = item.quantity;
      quantityInput.style.width = '40px';
      quantityInput.addEventListener('change', (e) => {
        item.quantity = parseInt(e.target.value) || 1;
        updateGroceryDisplay();
      });

      const price = entry && entry['Price (CAD)'] ? parseFloat(entry['Price (CAD)']) : null;
      const priceText = price ? `$${(price * item.quantity).toFixed(2)}` : 'N/A';

      if (price) total += price * item.quantity;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.style.marginLeft = '10px';
      removeBtn.addEventListener('click', () => {
        groceryList.splice(index, 1);
        updateGroceryDisplay();
      });

      li.appendChild(nameSpan);
      li.appendChild(document.createTextNode('Qty: '));
      li.appendChild(quantityInput);
      li.appendChild(document.createTextNode(` | Price: ${priceText}`));
      li.appendChild(removeBtn);
      groceryListItems.appendChild(li);
    });

    totalPriceElement.textContent = `Total (before tax): $${total.toFixed(2)}`;
  }
});
