// Item example
const salesData = [
    { orderId: 1, name: 'red trinket', quantity: 2, dateOrdered: '2024-08-15', totalPrice: '$3.98' },
    { orderId: 2, name: 'blue trinket', quantity: 1, dateOrdered: '2024-08-16', totalPrice: '$2.99' },
];

const tableBody = document.querySelector('#salesReportTable tbody');

function generateReport() {
    tableBody.innerHTML = '';
    if (salesData.length === 0) {
        return;
    }
    salesData.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.orderId}</td>
            <td>${data.name}</td>
            <td>${data.quantity}</td>
            <td>${data.dateOrdered}</td>
            <td>${data.totalPrice}</td>
        `;
        tableBody.appendChild(row);
    });
}

document.querySelector('#generateReport').addEventListener('click', generateReport);
