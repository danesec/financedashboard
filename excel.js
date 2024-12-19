function exportRevenueTableToCSV() {
    const table = document.getElementById('revenueTable');
    const rows = table.querySelectorAll('tr');
    const csv = [];

    rows.forEach(row => {
        if (row.style.display !== 'none') {
            const cells = row.querySelectorAll('th, td');
            const rowData = [];
            cells.forEach((cell, index) => {
                // Exclude the last column (Actions)
                if (index < cells.length - 1) {
                    rowData.push(cell.textContent);
                }
            });
            csv.push(rowData.join(','));
        }
    });

    const csvString = csv.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'revenue.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function exportExpenseTableToCSV() {
    const table = document.getElementById('expenseTable');
    const rows = table.querySelectorAll('tr');
    const csv = [];

    rows.forEach(row => {
        if (row.style.display !== 'none') {
            const cells = row.querySelectorAll('th, td');
            const rowData = [];
            cells.forEach((cell, index) => {
                // Exclude the last column (Actions)
                if (index < cells.length - 1) {
                    rowData.push(cell.textContent);
                }
            });
            csv.push(rowData.join(','));
        }
    });

    const csvString = csv.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'expenses.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function exportToExcel() {
    console.log('Export to Excel button clicked');
    const workbook = new ExcelJS.Workbook();
    const revenueSheet = workbook.addWorksheet('Revenue');
    const expenseSheet = workbook.addWorksheet('Expenses');
    const overallSheet = workbook.addWorksheet('Overall');

    // Export Revenue Table
    const revenueTable = document.getElementById('revenueTable');
    const revenueRows = Array.from(revenueTable.querySelectorAll('tr')).filter(row => row.style.display !== 'none');
    const revenueData = revenueRows.map(row => Array.from(row.querySelectorAll('th, td')).slice(0, -1).map(cell => cell.textContent));
    revenueData.forEach((row, index) => {
        revenueSheet.addRow(row);
    });

    // Export Expense Table
    const expenseTable = document.getElementById('expenseTable');
    const expenseRows = Array.from(expenseTable.querySelectorAll('tr')).filter(row => row.style.display !== 'none');
    const expenseData = expenseRows.map(row => Array.from(row.querySelectorAll('th, td')).slice(0, -1).map(cell => cell.textContent));
    expenseData.forEach((row, index) => {
        expenseSheet.addRow(row);
    });

    // Add Totals
    overallSheet.addRow(['Total Revenue', { formula: 'SUM(Revenue!G2:G1000)' }]);
    overallSheet.addRow(['Total Expenses', { formula: 'SUM(Expenses!F2:F1000)' }]);
    overallSheet.addRow(['Net Balance', { formula: 'B1-B2' }]);

    // Add Revenue & Expenses Categories Table
    overallSheet.addRow([]);
    overallSheet.addRow(['Category', 'Revenue', 'Expenses', 'Total']);
    const categories = ['Registration', 'Sponsorship', 'Donation', 'Auction', 'Other', 'Credit Card', 'Catering'];
    categories.forEach(category => {
        overallSheet.addRow([
            category,
            { formula: `SUMIF(Revenue!A2:A1000, "${category}", Revenue!G2:G1000)` },
            { formula: `SUMIF(Expenses!A2:A1000, "${category}", Expenses!F2:F1000)` },
            { formula: `B${overallSheet.lastRow.number} - C${overallSheet.lastRow.number}` }
        ]);
    });

    // Export Chart
    const chartCanvas = document.getElementById('myChart');
    chartCanvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = () => {
            const imageId = workbook.addImage({
                base64: reader.result,
                extension: 'png',
            });
            overallSheet.addImage(imageId, 'F1:J20');

            // Save Workbook
            workbook.xlsx.writeBuffer().then(buffer => {
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download', 'financial_summary.xlsx');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                console.log('Excel file generated');
            });
        };
        reader.readAsDataURL(blob);
    });
}

async function exportRevenueByInvoiceToCSV() {
    const response = await fetch('revenue_expenses.json');
    const data = await response.json();
    const revenue = data.revenue;

    const groupedData = revenue.reduce((acc, item) => {
        if (!acc[item.receipt]) {
            acc[item.receipt] = [];
        }
        acc[item.receipt].push(item);
        return acc;
    }, {});

    const csv = [];
    for (const receipt in groupedData) {
        const items = groupedData[receipt];
        const row = [receipt];
        items.forEach(item => {
            row.push(item.type, item.purchaseType, item.date, item.payment, item.name, item.contact, item.subtotal, item.fee, item.notes, item.status);
        });
        csv.push(row.join(','));
    }

    const csvString = csv.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'revenue_by_invoice.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Ensure the event listener is added after the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    const exportRevenueByInvoiceCsvBtn = document.getElementById('exportRevenueByInvoiceCsvBtn');
    if (exportRevenueByInvoiceCsvBtn) {
        exportRevenueByInvoiceCsvBtn.addEventListener('click', exportRevenueByInvoiceToCSV);
    }
});