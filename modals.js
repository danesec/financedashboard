// Verify element existence in HTML
function setupEventListeners() {
    const addRevenueBtn = document.getElementById('addRevenueBtn');
    const addRevenueModal = document.getElementById('addRevenueModal');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const addExpenseModal = document.getElementById('addExpenseModal');
    const closeBtns = document.querySelectorAll('.close');

    // Check if elements exist before adding event listeners
    if (addRevenueBtn) {
        addRevenueBtn.addEventListener('click', () => {
            clearForm('addRevenue');
            if (addRevenueModal) {
                addRevenueModal.classList.add('modal-background');
                addRevenueModal.style.display = 'flex';
            }
        });
    }

    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', () => {
            clearForm('addExpense');
            if (addExpenseModal) {
                addExpenseModal.classList.add('modal-background');
                addExpenseModal.style.display = 'flex';
            }
        });
    }

    // Close Modals
    closeBtns.forEach(closeBtn => {
        closeBtn.addEventListener('click', (event) => {
            const modalId = event.target.getAttribute('data-modal');
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                modalElement.style.display = 'none';
            }
        });
    });

    // Open Edit Expense Modal
    const expenseTableBody = document.getElementById('expenseTableBody');
    if (expenseTableBody) {
        expenseTableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('editBtn')) {
                const row = event.target.closest('tr');
                handleEdit(row);
            }
        });
    }

    // Open Edit Revenue Modal
    const revenueTableBody = document.getElementById('revenueTableBody');
    if (revenueTableBody) {
        revenueTableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('editBtn')) {
                const row = event.target.closest('tr');
                handleEdit(row);
            }
        });
    }
}

function handleEdit(row) {
    const formPrefix = row.closest('table').id === 'revenueTable' ? 'editRevenue' : 'editExpense';
    document.getElementById(`${formPrefix}Type`).value = row.cells[0].textContent;
    if (formPrefix === 'editRevenue') {
        document.getElementById(`${formPrefix}PurchaseType`).value = row.cells[1].textContent;
        document.getElementById(`${formPrefix}Date`).value = row.cells[2].textContent;
        // Shift all other field indices by 1
        document.getElementById(`${formPrefix}Receipt`).value = row.cells[3].textContent;
        document.getElementById(`${formPrefix}Payment`).value = row.cells[4].textContent;
        document.getElementById(`${formPrefix}Name`).value = row.cells[5].textContent;
        document.getElementById(`${formPrefix}Contact`).value = row.cells[6].textContent;
        document.getElementById(`${formPrefix}SubtotalInput`).value = parseFloat(row.cells[7].textContent.replace('$', ''));
        document.getElementById(`${formPrefix}Fee`).value = parseFloat(row.cells[8].textContent.replace('$', ''));
        document.getElementById(`${formPrefix}Notes`).value = row.cells[9].textContent;
    } else {
        document.getElementById(`${formPrefix}Date`).value = row.cells[1].textContent;
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

function handleDelete(row) {
    row.remove();
    updateSummary();
    drawCharts(); // Redraw charts after deleting an entry
}

function populateEditExpenseForm(row) {
    document.getElementById('editExpenseType').value = row.cells[0].textContent;
    document.getElementById('editExpenseDate').value = row.cells[1].textContent;
    document.getElementById('editExpensePayment').value = row.cells[2].textContent;
    document.getElementById('editExpenseName').value = row.cells[3].textContent;
    document.getElementById('editExpenseSubtotal').value = parseFloat(row.cells[4].textContent.replace('$', ''));
    document.getElementById('editExpenseFee').value = parseFloat(row.cells[5].textContent.replace('$', ''));
    document.getElementById('editExpenseNotes').value = row.cells[6].textContent;
    // Assuming 'status' is handled elsewhere
}
