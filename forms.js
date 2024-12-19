document.addEventListener('DOMContentLoaded', setupEventListeners);

function addEntry(type) {
    const formPrefix = `add${type}`;
    const tableBody = document.getElementById(`${type.toLowerCase()}TableBody`);

    const entryData = {
        type: document.getElementById(`${formPrefix}Type`).value,
        purchaseType: type === 'Revenue' ? document.getElementById(`${formPrefix}PurchaseType`).value : '',
        date: document.getElementById(`${formPrefix}Date`).value,
        receipt: type === 'Revenue' ? document.getElementById(`${formPrefix}Receipt`).value : '',
        payment: document.getElementById(`${formPrefix}Payment`).value,
        name: document.getElementById(`${formPrefix}Name`).value,
        contact: document.getElementById(`${formPrefix}Contact`).value,
        subtotal: parseFloat(document.getElementById(`${formPrefix}SubtotalInput`).value).toFixed(2), // Ensure 'SubtotalInput' exists
        fee: parseFloat(document.getElementById(`${formPrefix}Fee`).value).toFixed(2),
        notes: document.getElementById(`${formPrefix}Notes`).value,
        status: 'Unpaid' // Assuming new entries are unpaid by default
    };

    const row = document.createElement('tr');
    row.classList.add(entryData.status === 'Paid' ? 'paid' : 'unpaid');

    if (type === 'Expense') {
        row.innerHTML = `
            <td>${entryData.type}</td>
            <td>${entryData.date}</td>
            <td>${entryData.payment}</td>
            <td>${entryData.name}</td>
            <td>$${entryData.subtotal}</td>
            <td>$${entryData.fee}</td>
            <td>${entryData.notes}</td>
            <td class="status">${entryData.status}</td>
            <td>
                <div class="dropdown">
                    <button class="dropbtn">Actions</button>
                    <div class="dropdown-content">
                        <a href="#" class="markAsPaid">Mark as Paid</a>
                        <a href="#" class="markAsUnpaid">Mark as Unpaid</a>
                        <a href="#" class="editBtn">Edit</a>
                        <a href="#" class="deleteBtn">Delete</a>
                    </div>
                </div>
            </td>
        `;
    } else {
        row.innerHTML = `
            <td>${entryData.type}</td>
            ${type === 'Revenue' ? `<td>${entryData.purchaseType}</td>` : ''}
            <td>${entryData.date}</td>
            ${type === 'Revenue' ? `<td>${entryData.receipt}</td>` : ''}
            <td>${entryData.payment}</td>
            <td>${entryData.name}</td>
            <td>${entryData.contact}</td>
            <td>$${entryData.subtotal}</td>
            <td>$${entryData.fee}</td>
            <td>${entryData.notes}</td>
            <td class="status">${entryData.status}</td>
            <td>
                <div class="dropdown">
                    <button class="dropbtn">Actions</button>
                    <div class="dropdown-content">
                        <a href="#" class="markAsPaid">Mark as Paid</a>
                        <a href="#" class="markAsUnpaid">Mark as Unpaid</a>
                        <a href="#" class="editBtn">Edit</a>
                        <a href="#" class="deleteBtn">Delete</a>
                    </div>
                </div>
            </td>
        `;
    }

    tableBody.appendChild(row);
    updateSummary();
    drawCharts(); // Redraw charts after adding an entry
}

function updateEntry(type) {
    const formPrefix = `edit${type}`;
    const tableBody = document.getElementById(`${type.toLowerCase()}TableBody`);
    const editingRow = parseInt(document.getElementById(`${formPrefix}Form`).dataset.editingRow, 10);

    const entryData = {
        type: document.getElementById(`${formPrefix}Type`).value,
        purchaseType: type === 'Revenue' ? document.getElementById(`${formPrefix}PurchaseType`).value : '',
        date: document.getElementById(`${formPrefix}Date`).value,
        receipt: type === 'Revenue' ? document.getElementById(`${formPrefix}Receipt`).value : '',
        payment: document.getElementById(`${formPrefix}Payment`).value,
        name: document.getElementById(`${formPrefix}Name`).value,
        contact: document.getElementById(`${formPrefix}Contact`).value,
        subtotal: parseFloat(document.getElementById(`${formPrefix}SubtotalInput`).value).toFixed(2), // Ensure 'SubtotalInput' exists
        fee: parseFloat(document.getElementById(`${formPrefix}Fee`).value).toFixed(2),
        notes: document.getElementById(`${formPrefix}Notes`).value,
        status: 'Unpaid' // Or retrieve the current status if applicable
    };

    const row = tableBody.rows[editingRow - 1];
    if (type === 'Expense') {
        row.cells[0].textContent = entryData.type;
        row.cells[1].textContent = entryData.date;
        row.cells[2].textContent = entryData.payment;
        row.cells[3].textContent = entryData.name;
        row.cells[4].textContent = `$${entryData.subtotal}`;
        row.cells[5].textContent = `$${entryData.fee}`;
        row.cells[6].textContent = entryData.notes;
        row.cells[7].textContent = entryData.status;

        // Replace with Actions dropdown
        row.cells[8].innerHTML = `
            <div class="dropdown">
                <button class="dropbtn">Actions</button>
                <div class="dropdown-content">
                    <a href="#" class="markAsPaid">Mark as Paid</a>
                    <a href="#" class="markAsUnpaid">Mark as Unpaid</a>
                    <a href="#" class="editBtn">Edit</a>
                    <a href="#" class="deleteBtn">Delete</a>
                </div>
            </div>
        `;
    } else {
        row.cells[0].textContent = entryData.type;
        if (type === 'Revenue') {
            row.cells[1].textContent = entryData.purchaseType;
            row.cells[2].textContent = entryData.date;
            row.cells[3].textContent = entryData.receipt;
            row.cells[4].textContent = entryData.payment;
            row.cells[5].textContent = entryData.name;
            row.cells[6].textContent = entryData.contact;
            row.cells[7].textContent = `$${entryData.subtotal}`;
            row.cells[8].textContent = `$${entryData.fee}`;
            row.cells[9].textContent = entryData.notes;
        } else {
            row.cells[1].textContent = entryData.date;
            row.cells[2].textContent = entryData.payment;
            row.cells[3].textContent = entryData.name;
            row.cells[4].textContent = entryData.contact;
            row.cells[5].textContent = `$${entryData.subtotal}`;
            row.cells[6].textContent = `$${entryData.fee}`;
            row.cells[7].textContent = entryData.notes;
        }
        row.cells[type === 'Revenue' ? 10 : 9].textContent = entryData.status;

        // Replace Edit/Delete buttons with Actions dropdown
        row.cells[type === 'Revenue' ? 11 : 10].innerHTML = `
            <div class="dropdown">
                <button class="dropbtn">Actions</button>
                <div class="dropdown-content">
                    <a href="#" class="markAsPaid">Mark as Paid</a>
                    <a href="#" class="markAsUnpaid">Mark as Unpaid</a>
                    <a href="#" class="editBtn">Edit</a>
                    <a href="#" class="deleteBtn">Delete</a>
                </div>
            </div>
        `;
    }

    updateSummary();
    drawCharts(); // Redraw charts after updating an entry
}

function clearForm(formPrefix) {
    document.getElementById(`${formPrefix}Form`).reset();
    delete document.getElementById(`${formPrefix}Form`).dataset.editingRow;
}
