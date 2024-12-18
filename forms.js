document.addEventListener('DOMContentLoaded', setupEventListeners);

function addEntry(type) {
    const formPrefix = `add${type}`;
    const tableBody = document.getElementById(`${type.toLowerCase()}TableBody`);

    const entryData = {
        type: document.getElementById(`${formPrefix}Type`).value,
        date: document.getElementById(`${formPrefix}Date`).value,
        receipt: type === 'Revenue' ? document.getElementById(`${formPrefix}Receipt`).value : '',
        payment: document.getElementById(`${formPrefix}Payment`).value,
        name: document.getElementById(`${formPrefix}Name`).value,
        contact: document.getElementById(`${formPrefix}Contact`).value,
        subtotal: parseFloat(document.getElementById(`${formPrefix}SubtotalInput`).value).toFixed(2),
        fee: parseFloat(document.getElementById(`${formPrefix}Fee`).value).toFixed(2),
        notes: document.getElementById(`${formPrefix}Notes`).value
    };

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${entryData.type}</td>
        <td>${entryData.date}</td>
        ${type === 'Revenue' ? `<td>${entryData.receipt}</td>` : ''}
        <td>${entryData.payment}</td>
        <td>${entryData.name}</td>
        <td>${entryData.contact}</td>
        <td>$${entryData.subtotal}</td>
        <td>$${entryData.fee}</td>
        <td>${entryData.notes}</td>
        <td>
            <button class="editBtn">Edit</button>
            <button class="deleteBtn">Delete</button>
        </td>
    `;

    tableBody.appendChild(row);
    updateSummary();
    drawCharts(); // Redraw charts after adding an entry
}

function updateEntry(type) {
    const formPrefix = `edit${type}`;
    const tableBody = document.getElementById(`${type.toLowerCase()}TableBody`);
    const editingRow = document.getElementById(`${formPrefix}Form`).dataset.editingRow;

    const entryData = {
        type: document.getElementById(`${formPrefix}Type`).value,
        date: document.getElementById(`${formPrefix}Date`).value,
        receipt: type === 'Revenue' ? document.getElementById(`${formPrefix}Receipt`)?.value : '',
        payment: document.getElementById(`${formPrefix}Payment`).value,
        name: document.getElementById(`${formPrefix}Name`).value,
        contact: document.getElementById(`${formPrefix}Contact`).value,
        subtotal: parseFloat(document.getElementById(`${formPrefix}SubtotalInput`).value).toFixed(2),
        fee: parseFloat(document.getElementById(`${formPrefix}Fee`).value).toFixed(2),
        notes: document.getElementById(`${formPrefix}Notes`).value
    };

    const row = tableBody.rows[editingRow - 1];
    row.cells[0].textContent = entryData.type;
    row.cells[1].textContent = entryData.date;
    if (type === 'Revenue') {
        row.cells[2].textContent = entryData.receipt;
        row.cells[3].textContent = entryData.payment;
        row.cells[4].textContent = entryData.name;
        row.cells[5].textContent = entryData.contact;
        row.cells[6].textContent = `$${entryData.subtotal}`;
        row.cells[7].textContent = `$${entryData.fee}`;
        row.cells[8].textContent = entryData.notes;
    } else {
        row.cells[2].textContent = entryData.payment;
        row.cells[3].textContent = entryData.name;
        row.cells[4].textContent = entryData.contact;
        row.cells[5].textContent = `$${entryData.subtotal}`;
        row.cells[6].textContent = `$${entryData.fee}`;
        row.cells[7].textContent = entryData.notes;
    }

    updateSummary();
    drawCharts(); // Redraw charts after updating an entry
}

function clearForm(formPrefix) {
    document.getElementById(`${formPrefix}Form`).reset();
    delete document.getElementById(`${formPrefix}Form`).dataset.editingRow;
}
