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
        // Adjust the cell index based on table type
        if (tableBodyId === 'expenseTableBody') {
            const amount = parseFloat(row.cells[4].textContent.replace('$', '')); // 'Subtotal' is the 5th cell
            total += amount;
        } else {
            const amount = parseFloat(row.cells[6].textContent.replace('$', '')); // 'Subtotal' is the 7th cell for Revenue
            total += amount;
        }
    });

    return total;
}

// Remove or comment out duplicate setupEventListeners if it's already handled in modals.js
// function setupEventListeners() {
//     // ...existing event listener code...
// }

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

    const exportRevenueCsvBtn = document.getElementById('exportRevenueCsvBtn');
    if (exportRevenueCsvBtn) {
        exportRevenueCsvBtn.addEventListener('click', exportRevenueTableToCSV);
    }

    const exportExpenseCsvBtn = document.getElementById('exportExpenseCsvBtn');
    if (exportExpenseCsvBtn) {
        exportExpenseCsvBtn.addEventListener('click', exportExpenseTableToCSV);
    }

    const exportExcelBtn = document.getElementById('exportExcelBtn');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportToExcel);
    }

    const exportRevenueByInvoiceCsvBtn = document.getElementById('exportRevenueByInvoiceCsvBtn');
    if (exportRevenueByInvoiceCsvBtn) {
        exportRevenueByInvoiceCsvBtn.addEventListener('click', exportRevenueByInvoiceToCSV);
    }
}

function addEntry(type) {
    // ...existing code for handling form data...

    const row = document.createElement('tr');
    row.classList.add(entry.status === 'Paid' ? 'paid' : 'unpaid');

    row.innerHTML = `
        <td>${entry.type}</td>
        ${type === 'Revenue' ? `<td>${entry.purchaseType || '-'}</td>` : ''}
        <td>${entry.date}</td>
        ${type === 'Revenue' ? `<td>${entry.receipt}</td>` : ''}
        <td>${entry.payment}</td>
        <td>${entry.name}</td>
        <td>${entry.contact}</td>
        <td>$${entry.subtotal}</td>
        <td>$${entry.fee}</td>
        <td>${entry.notes}</td>
        <td class="status">${entry.status}</td>
        <td>
            <div class="dropdown">
                <button class="dropbtn">Actions</button>
                <div class="dropdown-content">
                    <a href="#" onclick="markAsPaid(this)">Mark as Paid</a>
                    <a href="#" onclick="markAsUnpaid(this)">Mark as Unpaid</a>
                    <a href="#" onclick="${type.toLowerCase()}EditEntry(this)">Edit</a>
                    <a href="#">Send invoice with PDF attached</a>
                    <a href="#">View Invoice</a>
                    <a href="#">Download invoice</a>
                    <a href="#" onclick="deleteEntry(this)">Delete</a>
                </div>
            </div>
        </td>
    `;

    document.getElementById(`${type.toLowerCase()}TableBody`).appendChild(row);
    updateSummary();
    if (typeof drawCharts === 'function') {
        drawCharts();
    }
}