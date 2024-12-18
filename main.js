document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateSummary();
    waitForChartElements();
});

function waitForChartElements() {
    const chartTypeElement = document.getElementById('chartType');
    const filterTypeElement = document.getElementById('filterType');

    if (chartTypeElement && filterTypeElement) {
        if (typeof drawCharts === 'function') {
            drawCharts();
        }
    } else {
        setTimeout(waitForChartElements, 100); // Retry after 100ms
    }
}

function updateSummary() {
    const revenueTotal = calculateTotal('revenueTableBody');
    const expenseTotal = calculateTotal('expenseTableBody');

    const revenueSubtotalElement = document.getElementById('revenueSubtotal');
    const expensesSubtotalElement = document.getElementById('expensesSubtotal');
    const totalBalanceElement = document.getElementById('totalBalance');

    if (revenueSubtotalElement) {
        revenueSubtotalElement.textContent = revenueTotal.toFixed(2);
    }
    if (expensesSubtotalElement) {
        expensesSubtotalElement.textContent = expenseTotal.toFixed(2);
    }
    if (totalBalanceElement) {
        totalBalanceElement.textContent = (revenueTotal - expenseTotal).toFixed(2);
    }
}

function calculateTotal(tableBodyId) {
    const rows = document.querySelectorAll(`#${tableBodyId} tr`);
    let total = 0;

    rows.forEach(row => {
        const amount = parseFloat(row.cells[6].textContent.replace('$', ''));
        total += amount;
    });

    return total;
}
function setupEventListeners() {
    const addRevenueBtn = document.getElementById('addRevenueBtn');
    const addExpenseBtn = document.getElementById('addExpenseBtn');

    if (addRevenueBtn) {
        addRevenueBtn.addEventListener('click', () => {
            clearForm('addRevenue');
            const modal = document.getElementById('addRevenueModal');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('modal-background');
            }
        });
    }

    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', () => {
            clearForm('addExpense');
            const modal = document.getElementById('addExpenseModal');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('modal-background');
            }
        });
    }

    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (event) => {
            const modalId = event.target.getAttribute('data-modal');
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                modalElement.style.display = 'none';
            }
        });
    });

    // Handle Add Revenue Form Submission
    const addRevenueForm = document.getElementById('addRevenueForm');
    if (addRevenueForm) {
        addRevenueForm.addEventListener('submit', (event) => {
            event.preventDefault();
            addEntry('Revenue');
            const modal = document.getElementById('addRevenueModal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Handle Add Expense Form Submission
    const addExpenseForm = document.getElementById('addExpenseForm');
    if (addExpenseForm) {
        addExpenseForm.addEventListener('submit', (event) => {
            event.preventDefault();
            addEntry('Expense');
            const modal = document.getElementById('addExpenseModal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Handle Edit Expense Form Submission
    const editExpenseForm = document.getElementById('editExpenseForm');
    if (editExpenseForm) {
        editExpenseForm.addEventListener('submit', (event) => {
            event.preventDefault();
            updateEntry('Expense');
            const modal = document.getElementById('editExpenseModal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Search and Filter Tables
    const revenueSearch = document.getElementById('revenueSearch');
    const expenseSearch = document.getElementById('expenseSearch');
    const revenueTypeFilter = document.getElementById('revenueTypeFilter');
    const expenseTypeFilter = document.getElementById('expenseTypeFilter');

    if (revenueSearch) {
        revenueSearch.addEventListener('input', filterTable);
    }
    if (expenseSearch) {
        expenseSearch.addEventListener('input', filterTable);
    }
    if (revenueTypeFilter) {
        revenueTypeFilter.addEventListener('change', filterTable);
    }
    if (expenseTypeFilter) {
        expenseTypeFilter.addEventListener('change', filterTable);
    }

    // Add event listeners for dynamic 'Edit' and 'Delete' buttons
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('editBtn')) {
            handleEdit(event.target.closest('tr'));
        } else if (event.target.classList.contains('deleteBtn')) {
            handleDelete(event.target.closest('tr'));
        }
    });
}