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

    // Handle Edit Revenue Form Submission
    const editRevenueForm = document.getElementById('editRevenueForm');
    if (editRevenueForm) {
        editRevenueForm.addEventListener('submit', (event) => {
            event.preventDefault();
            updateEntry('Revenue');
            const modal = document.getElementById('editRevenueModal');
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
        } else if (event.target.classList.contains('editEntry')) {
            handleEditCreditCard(event.target.closest('tr'));
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
}

function toggleStatus(element) {
    const row = element.closest('tr');
    const statusCell = row.querySelector('.status');
    if (statusCell.textContent === 'Paid') {
        statusCell.textContent = 'Unpaid';
        row.classList.remove('paid');
        row.classList.add('unpaid');
    } else {
        statusCell.textContent = 'Paid';
        row.classList.remove('unpaid');
        row.classList.add('paid');
    }
}

document.querySelectorAll('.toggleStatusBtn').forEach(button => {
    button.addEventListener('click', function() {
        toggleStatus(this);
    });
});

function populateRevenueTable(entries) {
    const tableBody = document.getElementById('revenueTableBody');
    if (!tableBody) {
        console.error(`Table body with ID 'revenueTableBody' not found.`);
        return;
    }
    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.classList.add(entry.status === 'Paid' ? 'paid' : 'unpaid');

        row.innerHTML = `
            <td>${entry.type}</td>
            <td>${entry.date}</td>
            <td>${entry.receipt}</td>
            <td>${entry.payment}</td>
            <td>${entry.name}</td>
            <td>${entry.contact}</td>
            <td>${entry.subtotal.toFixed(2)}</td>
            <td>${entry.fee.toFixed(2)}</td>
            <td>${entry.notes}</td>
            <td class="status">${entry.status}</td>
            <td>
                <div class="dropdown">
                    <button class="dropbtn">Actions</button>
                    <div class="dropdown-content">
                        <a href="#" onclick="markAsPaid(this)">Mark as Paid</a>
                        <a href="#" onclick="markAsUnpaid(this)">Mark as Unpaid</a>
                        <a href="#" onclick="editRevenueEntry(this)">Edit</a>
                        <a href="#" onclick="deleteEntry(this)">Delete</a>
                    </div>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function populateExpenseTable(entries) {
    const tableBody = document.getElementById('expenseTableBody');
    if (!tableBody) {
        console.error(`Table body with ID 'expenseTableBody' not found.`);
        return;
    }
    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.classList.add(entry.status === 'Paid' ? 'paid' : 'unpaid');

        row.innerHTML = `
            <td>${entry.type}</td>
            <td>${entry.date}</td>
            <td>${entry.payment}</td>
            <td>${entry.name}</td>
            <td>${entry.contact}</td>
            <td>${entry.subtotal.toFixed(2)}</td>
            <td>${entry.fee.toFixed(2)}</td>
            <td>${entry.notes}</td>
            <td class="status">${entry.status}</td>
            <td>
                <div class="dropdown">
                    <button class="dropbtn">Actions</button>
                    <div class="dropdown-content">
                        <a href="#" onclick="markAsPaid(this)">Mark as Paid</a>
                        <a href="#" onclick="markAsUnpaid(this)">Mark as Unpaid</a>
                        <a href="#" onclick="editExpenseEntry(this)">Edit</a>
                        <a href="#" onclick="deleteEntry(this)">Delete</a>
                    </div>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function markAsPaid(element) {
    const row = element.closest('tr');
    const statusCell = row.querySelector('.status');
    statusCell.textContent = 'Paid';
    row.classList.remove('unpaid');
    row.classList.add('paid');
}

function markAsUnpaid(element) {
    const row = element.closest('tr');
    const statusCell = row.querySelector('.status');
    statusCell.textContent = 'Unpaid';
    row.classList.remove('paid');
    row.classList.add('unpaid');
}

function handleEdit(row) {
    const formPrefix = row.closest('table').id === 'revenueTable' ? 'editRevenue' : 'editExpense';
    document.getElementById(`${formPrefix}Type`).value = row.cells[0].textContent;
    document.getElementById(`${formPrefix}Date`).value = row.cells[1].textContent;
    if (formPrefix === 'editRevenue') {
        document.getElementById(`${formPrefix}Receipt`).value = row.cells[2].textContent;
        document.getElementById(`${formPrefix}Payment`).value = row.cells[3].textContent;
        document.getElementById(`${formPrefix}Name`).value = row.cells[4].textContent;
        document.getElementById(`${formPrefix}Contact`).value = row.cells[5].textContent;
        document.getElementById(`${formPrefix}SubtotalInput`).value = parseFloat(row.cells[6].textContent.replace('$', ''));
        document.getElementById(`${formPrefix}Fee`).value = parseFloat(row.cells[7].textContent.replace('$', ''));
        document.getElementById(`${formPrefix}Notes`).value = row.cells[8].textContent;
    } else {
        document.getElementById(`${formPrefix}Payment`).value = row.cells[2].textContent;
        document.getElementById(`${formPrefix}Name`).value = row.cells[3].textContent;
        document.getElementById(`${formPrefix}Contact`).value = row.cells[4].textContent;
        document.getElementById(`${formPrefix}SubtotalInput`).value = parseFloat(row.cells[5].textContent.replace('$', ''));
        document.getElementById(`${formPrefix}Fee`).value = parseFloat(row.cells[6].textContent.replace('$', ''));
        document.getElementById(`${formPrefix}Notes`).value = row.cells[7].textContent;
    }
    document.getElementById(`${formPrefix}Modal`).style.display = 'flex';
    document.getElementById(`${formPrefix}Form`).dataset.editingRow = row.rowIndex;
}

function handleEditCreditCard(row) {
    const defaultPercentage = 2.9;
    const defaultAmount = 0.30;

    const percentage = prompt("Enter Credit Card Fee Percentage:", defaultPercentage);
    const amount = prompt("Enter Credit Card Fee Amount:", defaultAmount);

    if (percentage !== null && amount !== null) {
        row.querySelector('#creditCardFee').textContent = `$${(parseFloat(percentage) + parseFloat(amount)).toFixed(2)}`;
    }
}

function deleteEntry(element) {
    const row = element.closest('tr');
    row.remove();
    updateSummary();
    if (typeof drawCharts === 'function') {
        drawCharts();
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

function editExpenseEntry(element) {
    const row = element.closest('tr');
    handleEdit(row);
}

function editRevenueEntry(element) {
    const row = element.closest('tr');
    handleEdit(row);
}

/* JavaScript to adjust positioning if needed */
document.addEventListener('mouseover', (event) => {
    const dropdown = event.target.closest('.dropdown');
    if (dropdown) {
        const content = dropdown.querySelector('.dropdown-content');
        const rect = content.getBoundingClientRect();

        // Check for overflow only once, not during every hover
        if (!content.dataset.aligned) {
            if (rect.right > window.innerWidth) {
                content.style.left = 'auto';
                content.style.right = '0';
            } else {
                content.style.left = '0';
                content.style.right = 'auto';
            }
            content.dataset.aligned = 'true'; // Mark as aligned
        }
    }
});




