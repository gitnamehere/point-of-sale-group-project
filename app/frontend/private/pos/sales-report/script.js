let salesData = [];

fetch("/api/orders")
    .then((response) => {
        return response.json();
    })
    .then((body) => {
        for (let order of body) {
            salesData.push(order);
        }
    })
    .catch((error) => {
        console.log(error);
    });

console.log(salesData);

const tableBody = document.querySelector("#salesReportTable tbody");

function generateReport() {
    tableBody.innerHTML = "";
    if (salesData.length === 0) {
        return;
    }
    salesData.forEach((data) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${data.id}</td>
            <td>${data.date_ordered}</td>
            <td>${data.is_paid}</td>
            <td>${data.subtotal}</td>
            <td>${data.total}</td>
        `;
        tableBody.appendChild(row);
    });
}

document
    .querySelector("#generateReport")
    .addEventListener("click", generateReport);
