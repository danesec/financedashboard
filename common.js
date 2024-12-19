function filterTable() {
    const revenueQuery = document.getElementById('revenueSearch')?.value.toLowerCase() || '';
    const expenseQuery = document.getElementById('expenseSearch')?.value.toLowerCase() || '';
    const revenueTypeFilter = document.getElementById('revenueTypeFilter')?.value || '';
    const expenseTypeFilter = document.getElementById('expenseTypeFilter')?.value || '';

    filterRows('#revenueTableBody tr', {
        searchQuery: revenueQuery,
        typeFilter: revenueTypeFilter,
        isRevenue: true
    });

    filterRows('#expenseTableBody tr', {
        searchQuery: expenseQuery,
        typeFilter: expenseTypeFilter,
        isRevenue: false
    });

    // Update the summary texts
    updateSummaryText('revenueSubtotalText', revenueTypeFilter);
    updateSummaryText('expensesSubtotalText', expenseTypeFilter);

    // Update totals after filtering
    updateSummary();
}

function filterRows(selector, options) {
    const { searchQuery, typeFilter, isRevenue } = options;
    const rows = document.querySelectorAll(selector);

    rows.forEach(row => {
        const cells = row.cells;
        if (!cells.length) return;

        const type = cells[0].textContent.toLowerCase();
        const purchaseType = isRevenue ? cells[1].textContent.toLowerCase() : '';
        const name = isRevenue ? cells[5].textContent.toLowerCase() : cells[3].textContent.toLowerCase();
        const receipt = isRevenue ? cells[3].textContent.toLowerCase() : '';
        // const contact = isRevenue ? cells[6].textContent.toLowerCase() : ''; // Removed 'Contact' for Expenses
        const notes = isRevenue ? cells[6].textContent.toLowerCase() : cells[5].textContent.toLowerCase();

        const matchesSearch = searchQuery === '' || 
            name.includes(searchQuery) || 
            type.includes(searchQuery) || 
            purchaseType.includes(searchQuery) ||  // Add Purchase Type to search
            (isRevenue && receipt.includes(searchQuery)) || 
            notes.includes(searchQuery);

        const matchesType = typeFilter === '' || type === typeFilter.toLowerCase();

        if (matchesSearch && matchesType) {
            row.style.display = '';
            row.classList.remove('hidden');
        } else {
            row.style.display = 'none';
            row.classList.add('hidden');
        }
    });
}

function updateSummaryText(elementId, filterValue) {
    const element = document.getElementById(elementId);
    if (element) {
        const baseText = elementId.includes('revenue') ? 'Revenue' : 'Expenses';
        const displayFilter = filterValue || 'All';
        element.textContent = `${baseText} (${displayFilter}):`;
    }
}