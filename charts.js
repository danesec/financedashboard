let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    function initializeCharts() {
        const chartTypeElement = document.getElementById('chartType');
        const filterTypeElement = document.getElementById('filterType');

        if (chartTypeElement && filterTypeElement) {
            drawCharts();

            chartTypeElement.addEventListener('change', drawCharts);
            filterTypeElement.addEventListener('change', drawCharts);
        } else {
            console.error('Required elements not found in the DOM');
        }
    }

    // Wait for a short delay to ensure elements are present in the DOM
    setTimeout(initializeCharts, 100); // 100ms delay
});

function drawCharts() {
    const chartElement = document.getElementById('myChart');
    const chartTypeElement = document.getElementById('chartType');
    const filterTypeElement = document.getElementById('filterType');

    if (!chartTypeElement || !filterTypeElement || !chartElement) {
        console.error('Required elements not found in the DOM');
        return;
    }

    const chartType = chartTypeElement.value;
    const filterType = filterTypeElement.value;

    const { revenueData, expensesData, labels } = getData(filterType);

    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = chartElement.getContext('2d');
    ctx.clearRect(0, 0, chartElement.width, chartElement.height);

    const datasets = filterType === 'all' ? [{
        label: 'Net Amount',
        data: revenueData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
    }] : [
        {
            label: 'Total Revenue',
            data: revenueData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        },
        {
            label: 'Total Expenses',
            data: expensesData,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }
    ];

    chartInstance = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function getData(filterType) {
    if (filterType === 'all') {
        const { data, labels } = extractCombinedData(['Registration', 'Sponsorship', 'Credit Card', 'Auction', 'Donation', 'Other']);
        return {
            revenueData: data,
            expensesData: [],
            labels: labels
        };
    }

    // Get filtered data
    const revenueData = extractDataFromTable('revenueTableBody', filterType);
    const expensesData = extractDataFromTable('expenseTableBody', filterType);

    // Calculate total for the category
    const totalRevenue = revenueData.data.reduce((sum, val) => sum + val, 0);
    const totalExpenses = expensesData.data.reduce((sum, val) => sum + val, 0);

    // Get all dates
    const allDates = [...new Set([...revenueData.dates, ...expensesData.dates])]
        .filter(date => date && date !== '-' && date !== 'Auto')
        .sort();

    if (allDates.length === 0) {
        // If no dates, return single bar with totals
        return {
            revenueData: [totalRevenue],
            expensesData: [totalExpenses],
            labels: [filterType]
        };
    }

    return {
        revenueData: [totalRevenue],
        expensesData: [totalExpenses],
        labels: [filterType]
    };
}

function getWeekKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay()); // Set to Sunday
    return d.toISOString().split('T')[0];
}

function extractCombinedData(allowedTypes) {
    const revenueData = extractDataFromTable('revenueTableBody', 'all');
    const expensesData = extractDataFromTable('expenseTableBody', 'all');

    const combinedData = [];
    const combinedLabels = [];

    allowedTypes.forEach(type => {
        const revenueIndex = revenueData.labels.indexOf(type);
        const expenseIndex = expensesData.labels.indexOf(type);

        if (revenueIndex !== -1) {
            combinedLabels.push(type);
            if (expenseIndex !== -1) {
                combinedData.push(revenueData.data[revenueIndex] - expensesData.data[expenseIndex]);
            } else {
                combinedData.push(revenueData.data[revenueIndex]);
            }
        } else if (expenseIndex !== -1) {
            combinedLabels.push(type);
            combinedData.push(-expensesData.data[expenseIndex]);
        }
    });

    return {
        data: combinedData,
        labels: combinedLabels
    };
}

function extractDataFromTable(tableBodyId, filterType) {
    const rows = document.querySelectorAll(`#${tableBodyId} tr`);
    const data = [];
    const labels = [];
    const dates = [];

    const isExpenseTable = tableBodyId === 'expenseTableBody';
    
    rows.forEach(row => {
        if (!row.cells || row.cells.length < 7) return;
        
        const type = row.cells[0].textContent.trim();
        const date = row.cells[1].textContent.trim();
        const amountCell = isExpenseTable ? row.cells[5] : row.cells[6];
        const amountText = amountCell.textContent.replace(/[$,]/g, '').trim();
        const amount = parseFloat(amountText);

        if ((filterType === 'all' || filterType === type) && !isNaN(amount)) {
            labels.push(type);
            data.push(amount);
            dates.push(date);
        }
    });

    return { data, labels, dates };
}

// ...existing code...
