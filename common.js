function filterTable() {
    const revenueQuery = document.getElementById('revenueSearch').value.toLowerCase();
    const expenseQuery = document.getElementById('expenseSearch').value.toLowerCase();
    const revenueRows = document.querySelectorAll('#revenueTableBody tr');
    const expenseRows = document.querySelectorAll('#expenseTableBody tr');
    const revenueTypeFilter = document.getElementById('revenueTypeFilter').value.toLowerCase();
    const expenseTypeFilter = document.getElementById('expenseTypeFilter').value.toLowerCase();

    filterRows(revenueRows, revenueQuery, revenueTypeFilter, true);
    filterRows(expenseRows, expenseQuery, expenseTypeFilter, false);
}

function filterRows(rows, query, typeFilter, isRevenue) {
    rows.forEach(row => {
        const description = row.cells[0].textContent.toLowerCase();
        const receipt = isRevenue ? row.cells[2].textContent.toLowerCase() : '';
        const contact = row.cells[isRevenue ? 5 : 4].textContent.toLowerCase();
        const matchesQuery = description.includes(query) || (isRevenue && receipt.includes(query)) || contact.includes(query);
        const matchesType = typeFilter === '' || description.includes(typeFilter);
        row.style.display = matchesQuery && matchesType ? '' : 'none';
    });
}