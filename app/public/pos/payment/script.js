const params = new URLSearchParams(window.location.search);
const orderId = params.get('id');
const ticketItems = document.getElementById("ticket-table");
const subtotalElement = document.getElementById("subtotal");
const discount = 1.00; // placeholder - need to hash out specifics for discounts
const tax = 0.08; // placeholder - need to hash out specifics for tax caluclation
const totalElement = document.getElementById("total");
const amountDue = document.getElementById("amountDue");
const cashInput = document.getElementById("cashInput");
const buttons = document.querySelectorAll(".num-btn");
const clearButton = document.getElementById("clear");
const changeElement = document.getElementById("change");
const payButton = document.getElementById("pay");

buttons.forEach(button => {
    button.addEventListener("click", function () {
        let value = button.getAttribute("data-value");
        let currentValue = parseFloat(cashInput.value.replace('$', ''));

        // handling for '.'
        if (value === '.' && currentValue.includes('.')) {
            return;
        }

        // handling for leading '0'
        if (currentValue === '0' && value !== '.') {
            currentValue = '';
        }

        currentValue += value;
        let amount = parseFloat(currentValue);
        cashInput.value = isNaN(amount) ? '$0.00' : `$${amount.toFixed(2)}`;
    });
});

clearButton.addEventListener("click", function () {
    cashInput.value = "$0.00";
});

fetch(`/api/orders/${orderId}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    }
})
    .then(response => {
        return response.json();
    })
    .then(data => {
        // subtotal calculation
        const subtotal = parseFloat(data.subtotal);
        subtotalElement.textContent = "$" + " " + data.subtotal;

        // total calculation
        const total = (subtotal - discount) * (1 + tax);
        totalElement.textContent = "$" + " " + total.toFixed(2);
        amountDue.textContent = "$" + " " + total.toFixed(2);

        // change calculation
        cashInput.addEventListener('input', () => {
            let cash = parseFloat(cashInput.value.replace('$', ''));
            if (isNaN(cash)) cash = 0;
            const change = cash - total;
            changeElement.textContent = "$" + " " + change.toFixed(2);
        });
    })
    .catch(error => {
        console.log(error);
    });
