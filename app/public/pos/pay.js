const cartItems = document.getElementById("cart");
const subtotalElement = document.getElementById("subtotal");
const discountElement = 1.00; // placeholder - need to hash out specifics for discounts
const taxElement = 0.08; // placeholder - need to hash out specifics for tax caluclation
const totalElement = document.getElementById("total");
const cashInput = document.getElementById("cash");
const changeElement = document.getElementById("change");
const payButton = documnet.getElementById("pay");
const message = document.getElementById("message");

fetch("/api/items")
    .then(response => {
        return response.json();
    })
    .then(response => {
        // subtotal calculation
        let subtotal = 0;
        for (let i = 0; i < response.length; i++) {
            if (cartItems.includes(item[i].id)) {
                subtotal += response[i].price;
            }
        }
        subtotalElement.textContent = subtotal.toFixed(2);

        // total calculation
        const total = (subtotal - discount) * (1 + tax);
        totalElement.textContent = total.toFixed(2);

        // change calculation
        let cash = cashInput.value;
        const change = cash - total;
        changeElement.textContent = change.toFixed(2);

        // need to implement DOM for pay button prompt

        message.textContent = (response.ok ? "Success" : "Failure");
    })
    .catch(error => {
        console.log(error);
    });
