// what the
// TODO: refactor

const newOrder = document.getElementById("newOrder");
const activeOrders = document.getElementById("activeOrders");
const orderHistory = document.getElementById("orderHistory");
const itemManagement = document.getElementById("itemManagement");
const salesReporting = document.getElementById("salesReporting");
const storeSettings = document.getElementById("storeSettings");

newOrder.addEventListener("click", () => {
    newOrder.style.backgroundColor = "blue";
    location.href = "/pos/ordering";
});

activeOrders.addEventListener("click", () => {
    activeOrders.style.backgroundColor = "blue";
    location.href = "/pos/orders";
});

orderHistory.addEventListener("click", () => {
    orderHistory.style.backgroundColor = "blue";
    location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
});

itemManagement.addEventListener("click", () => {
    itemManagement.style.backgroundColor = "blue";
    location.href = "/pos/item-management/create.html";
});

salesReporting.addEventListener("click", () => {
    salesReporting.style.backgroundColor = "blue";
    location.href = "/pos/sales-report";
});

storeSettings.addEventListener("click", () => {
    storeSettings.style.backgroundColor = "blue";
    location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
});
