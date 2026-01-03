document.addEventListener('DOMContentLoaded', () => {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR0HqnwgJkdwjTH2FI092uGK9-RsBfk-9OUGuQaAHhqbXHYtC2-PuVXwWI8JYQPVkCUSuaX1I_GHz-T/pub?output=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n').map(row => row.split(','));

      // Assume first row is header
      const headers = rows[0];
      const entries = rows.slice(1);

      // Now use entries to populate comparison / grocery logic
      console.log({ headers, entries });

      // For example, renderComparison(entries);
      // renderGroceryList(entries);
    })
    .catch(error => console.error('Error loading CSV:', error));
});
