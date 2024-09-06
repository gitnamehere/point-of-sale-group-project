const filterBtn = document.getElementById("filterButton");
const orderCountElement = document.getElementById("orderCount");
const paidOrdersElement = document.getElementById("paidOrders");
const totalProfitElement = document.getElementById("totalProfit");
const totalDiscountsElement = document.getElementById("totalDiscounts");
const totalTipsElement = document.getElementById("totalTips");
const tableBody = document.querySelector("#salesReportTable tbody");
const itemOrderedTotalElement = document.getElementById("itemOrderedTotal");
const itemProfitlElement = document.getElementById("itemProfit");
let salesData = [];
let itemCache = {};

fetch("/api/orders")
    .then((response) => {
        return response.json();
    })
    .then((body) => {
        salesData = body;
        // fetching items for caching
        return Promise.all(
            Array.from(
                new Set(
                    salesData.flatMap((order) =>
                        Object.keys(order.items || {}),
                    ),
                ),
            ).map((id) =>
                fetch(`/api/items/${id}`)
                    .then((response) => response.json())
                    .then((item) => (itemCache[id] = item[0])),
            ),
        );
    })
    .then(() => {
        updateOrderCount();
        updatePaidOrderCount();
        updateTotalProfit();
        updateTotalDiscounts();
        updateTotalTips();
        generateReport(salesData);
    })
    .catch((error) => console.log(error));

document.addEventListener("DOMContentLoaded", () => {
    filterBtn.addEventListener("click", filter);
});

function updateOrderCount() {
    orderCountElement.textContent = salesData.length;
}

function updatePaidOrderCount() {
    const paidOrders = salesData.filter((order) => order.is_paid === true);
    paidOrdersElement.textContent = paidOrders.length;
}

function updateTotalProfit() {
    const totalProfit = salesData
        .filter((order) => order.is_paid) // Filter to include only paid orders
        .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    totalProfitElement.textContent = totalProfit.toFixed(2);
}

function updateTotalDiscounts() {
    const totalDiscounts = salesData
        .filter((order) => order.is_paid)
        .reduce((sum, order) => sum + (parseFloat(order.discount) || 0), 0);
    totalDiscountsElement.textContent = totalDiscounts.toFixed(2);
}

function updateTotalTips() {
    const totalTips = salesData
        .filter((order) => order.is_paid)
        .reduce((sum, order) => sum + (parseFloat(order.tips) || 0), 0);
    totalTipsElement.textContent = totalTips.toFixed(2);
}

function filter() {
    const filterDateInput = document.getElementById("filterDate").value;
    const filterItemInput = document
        .getElementById("filterItem")
        .value.toLowerCase();

    let filteredData = salesData;
    let totalQuantity = 0;
    let totalProfit = 0;

    if (filterDateInput) {
        const filterDate = new Date(filterDateInput)
            .toISOString()
            .split("T")[0]; // YYYY-MM-DD
        filteredData = filteredData.filter((order) => {
            const orderDate = new Date(order.date_ordered)
                .toISOString()
                .split("T")[0];
            return orderDate === filterDate;
        });
    }

    if (filterItemInput) {
        filteredData = filteredData.filter((order) => {
            return Object.keys(order.items || {}).some((id) => {
                const item = itemCache[id];
                if (item && item.name.toLowerCase().includes(filterItemInput)) {
                    totalQuantity += order.items[id];
                    if (order.is_paid) {
                        totalProfit += item.price * order.items[id];
                    }
                    return true;
                }
                return false;
            });
        });
    }

    itemOrderedTotalElement.textContent = totalQuantity;
    itemProfitlElement.textContent = totalProfit.toFixed(2);

    generateReport(filteredData);
}

function generateReport(data) {
    tableBody.innerHTML = "";
    if (data.length === 0) {
        return;
    }
    data.forEach((order) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${order.id}</td>
            <td>${order.date_ordered}</td>
            <td>${order.is_paid}</td>
            <td>${order.subtotal}</td>
            <td>${order.discount || (0.0).toFixed(2)}</td>
            <td>${order.tips || (0.0).toFixed(2)}</td>
            <td>${order.total}</td>
        `;

        const detailTr = document.createElement("tr");
        detailTr.classList.add("collapse");
        detailTr.innerHTML = `
            <td colspan="7">
                <table class="table table-striped item-details"; width: 100%;">
                    <thead>
                        <tr>
                            <th scope="col">Item ID</th>
                            <th scope="col">Product Name</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </td>
        `;

        tr.addEventListener("click", () => {
            detailTr.classList.toggle("show");
            const tbody = detailTr.querySelector("tbody");

            if (tbody.children.length === 0) {
                const itemIds = Object.keys(order.items || {});

                itemIds.forEach((id) => {
                    fetch(`/api/items/${id}`)
                        .then((response) => response.json())
                        .then((item) => {
                            const itemRow = document.createElement("tr");
                            itemRow.innerHTML = `
                                <td>${item[0].id}</td>
                                <td>${item[0].name}</td>
                                <td>${order.items[id]}</td>
                                <td>$${(item[0].price * order.items[id]).toFixed(2)}</td>
                            `;
                            tbody.appendChild(itemRow);
                        })
                        .catch((error) => console.log(error));
                });
            }
        });

        tableBody.appendChild(tr);
        tableBody.appendChild(detailTr);
    });
}
