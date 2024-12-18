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

    if (!chartTypeElement || !filterTypeElement) {
        console.error('Required elements not found in the DOM');
        return;
    }

    const chartType = chartTypeElement.value;
    const filterType = filterTypeElement.value;

    const { revenueData, expensesData, labels } = getData(filterType); // Modified to return separate data arrays

    if (chartElement) {
        const ctx = chartElement.getContext('2d');

        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }

        ctx.clearRect(0, 0, chartElement.width, chartElement.height);

        let timeUnit = 'week';
        if (filterType !== 'all' && labels.length > 0) {
            const firstDate = new Date(labels[0]);
            const lastDate = new Date(labels[labels.length - 1]);
            const monthsDiff = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + 
                             (lastDate.getMonth() - firstDate.getMonth());
            
            timeUnit = monthsDiff > 6 ? 'month' : 'week';
        }

        const datasets = filterType === 'all' ? [{
            label: 'Net Amount',
            data: revenueData, // In 'all' mode, revenueData contains the net amounts
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
                scales: chartType === 'pie' || chartType === 'doughnut' ? {} : {
                    x: {
                        type: filterType === 'all' ? 'category' : 'time',
                        time: filterType === 'all' ? undefined : {
                            unit: timeUnit,
                            parser: 'yyyy-MM-dd',
                            displayFormats: {
                                week: 'MMM d, yyyy',
                                month: 'MMM yyyy'
                            }
                        },
                        ticks: {
                            source: 'auto',
                            maxRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function getData(filterType) {
    const allowedTypes = ['Registration', 'Sponsorship', 'Credit Card', 'Auction', 'Donation', 'Other'];

    if (filterType === 'all') {
        const { data, labels } = extractCombinedData(allowedTypes);
        return {
            revenueData: data,
            expensesData: [],
            labels: labels
        };
    } else {
        // Get filtered data for the specific type
        const revenueData = extractDataFromTable('revenueTableBody', filterType);
        const expensesData = extractDataFromTable('expenseTableBody', filterType);

        // Calculate totals for the specific type
        const typeRevenue = revenueData.data.reduce((sum, amount) => sum + (isNaN(amount) ? 0 : amount), 0);
        const typeExpenses = expensesData.data.reduce((sum, amount) => sum + (isNaN(amount) ? 0 : amount), 0);

        console.log('Type:', filterType);
        console.log('Revenue Total:', typeRevenue);
        console.log('Expenses Total:', typeExpenses);

        // Get unique dates and sort them
        const dates = [...new Set([...revenueData.dates, ...expensesData.dates])]
            .filter(date => date !== '-' && date !== 'Auto')
            .map(date => {
                if (!date) return null;
                const parts = date.split('/');
                if (parts.length === 3) {
                    const [month, day, year] = parts;
                    return new Date(year, month - 1, day).toISOString().split('T')[0];
                }
                return date;
            })
            .filter(date => date !== null)
            .sort();

        // Ensure we have at least one date
        if (dates.length === 0) {
            dates.push(new Date().toISOString().split('T')[0]);
        }

        // Create arrays with the same total for each date
        const revenues = new Array(dates.length).fill(typeRevenue);
        const expenses = new Array(dates.length).fill(typeExpenses);

        return {
            revenueData: revenues,
            expensesData: expenses,
            labels: dates
        };
    }
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

    // Determine if we're working with revenue or expense table
    const isExpenseTable = tableBodyId === 'expenseTableBody';
    
    rows.forEach(row => {
        if (!row.cells || row.cells.length < 7) return;
        
        const type = row.cells[0].textContent.trim();
        if (filterType === 'all' || filterType === type) {
            const label = type;
            // Use column 6 (Subtotal) for expenses, column 7 (Fees) for revenue
            const amountCell = isExpenseTable ? row.cells[5] : row.cells[6];
            const amountText = amountCell.textContent.replace(/[$,]/g, '').trim();
            const amount = parseFloat(amountText);
            const date = row.cells[1].textContent.trim();
            
            if (!isNaN(amount)) {
                labels.push(label);
                data.push(amount);
                dates.push(date);
            }
        }
    });

    return { data, labels, dates };
}

// ...existing code...
