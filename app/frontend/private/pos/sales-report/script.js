const filterBtn = document.getElementById("filterButton");
const orderCountElement = document.getElementById("orderCount");
const paidOrdersElement = document.getElementById("paidOrders");
const totalProfitElement = document.getElementById("totalProfit");
const totalDiscountsElement = document.getElementById("totalDiscounts");
const totalTipsElement = document.getElementById("totalTips");
const tableBody = document.querySelector("#salesReportTable tbody");
let salesData = [];

fetch("/api/orders")
    .then((response) => {
        return response.json();
    })
    .then((body) => {
        salesData = body;
        updateOrderCount();
        updatePaidOrderCount();
        updateTotalProfit();
        updateTotalDiscounts();
        updateTotalTips();
        generateReport(salesData);
    })
    .catch((error) => {
        console.log(error);
    });

document.addEventListener("DOMContentLoaded", () => {
    filterBtn.addEventListener("click", filterByDate);
})

function updateOrderCount() {
    orderCountElement.textContent = salesData.length;
}

function updatePaidOrderCount() {
    const paidOrders = salesData.filter(order => order.is_paid === true);
    paidOrdersElement.textContent = paidOrders.length;
}

function updateTotalProfit() {
    const totalProfit = salesData.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    totalProfitElement.textContent = totalProfit.toFixed(2);
}

function updateTotalDiscounts() {
    const totalDiscounts = salesData.reduce((sum, order) => sum + (parseFloat(order.discount) || 0), 0);
    totalDiscountsElement.textContent = totalDiscounts.toFixed(2);
}

function updateTotalTips() {
    const totalTips = salesData.reduce((sum, order) => sum + (parseFloat(order.tips) || 0), 0);
    totalTipsElement.textContent = totalTips.toFixed(2);
}

function filterByDate() {
    const filterDateInput = document.getElementById("filterDate").value

    if (!filterDateInput) {
        generateReport(salesData);
        return;
    }

    const filterDate = new Date(filterDateInput).toISOString().split('T')[0]; // YYYY-MM-DD
    const filteredData = salesData.filter(order => {
        const orderDate = new Date(order.date_ordered).toISOString().split('T')[0];
        return orderDate === filterDate;
    });
    
    generateReport(filteredData);
}

function generateReport(data) {
    tableBody.innerHTML = "";
    if (data.length === 0) {
        return;
    }
    data.forEach((order) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.date_ordered}</td>
            <td>${order.is_paid}</td>
            <td>${order.subtotal}</td>
            <td>${order.discount || 0.00.toFixed(2)}</td>
            <td>${order.tips || 0.00.toFixed(2)}</td>
            <td>${order.total}</td>
        `;
        tableBody.appendChild(row);
    });
}
