const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");
const ticketItems = document.getElementById("ticket-table");
const subtotalElement = document.getElementById("subtotal");
const discountInput = document.getElementById("discountInput");
const discountBtn = document.getElementById("discountButton");
const discountElement = document.getElementById("discount");
const tipBtns = document.querySelectorAll(".tip-btn");
const tipElement = document.getElementById("tips");
const taxElement = document.getElementById("tax");
const tax = 0.08; // holding for dev use - will need to implement business owner customization
const totalElement = document.getElementById("total");
const amountDue = document.getElementById("amountDue");
const cashInput = document.getElementById("cashInput");
const numPadBtns = document.querySelectorAll(".num-btn");
const clearBtn= document.getElementById("clear");
const changeElement = document.getElementById("change");
const payBtn = document.getElementById("pay");
let discount = 0;
let tips = 0;

numPadBtns.forEach((button) => {
    button.addEventListener("click", function () {
        let value = button.getAttribute("data-value");
        let currentValue = parseFloat(cashInput.value.replace("$", ""));

        // handling for leading '0'
        if (currentValue === "0" && value !== ".") {
            currentValue = "";
        }

        currentValue += value;
        let amount = parseFloat(currentValue);
        cashInput.value = isNaN(amount) ? "$0.00" : `$ ${amount.toFixed(2)}`;
    });
});

clearBtn.addEventListener("click", function () {
    cashInput.value = "$0.00";
});

function updateCalculations(subtotal, discount, tip) {
    const discountAmount = subtotal * discount;
    const discountedSubtotal = subtotal - discountAmount;
    const tipAmount = subtotal * tip;
    const taxAmount = discountedSubtotal * tax;
    const total = discountedSubtotal * (1 + tax) + tipAmount;

    discountElement.textContent = "$ " + discountAmount.toFixed(2);
    tipElement.textContent = "$ " + tipAmount.toFixed(2);
    taxElement.textContent = "$ " + taxAmount.toFixed(2);
    totalElement.textContent = "$ " + total.toFixed(2);
    amountDue.textContent = "$ " + total.toFixed(2);
}

fetch(`/api/orders/${orderId}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
})
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        // subtotal calculation
        const subtotal = parseFloat(data[0].subtotal);
        subtotalElement.textContent = `$ ${subtotal.toFixed(2)}`;

        // initial calculation before discount and tip
        updateCalculations(subtotal, 0, 0);

        discountButton.addEventListener("click", () => {
            const code = discountInput.value.trim();

            if (code) {
                fetch(`/api/discounts/${code}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                    .then((response) => response.json())
                    .then((data) => {
                        discount = data[0].discount;
                        discountElement.textContent = `$ ${discount.toFixed(2)}`;
                        updateCalculations(subtotal, discount);
                    })
                    .catch((error) => {
                        console.log(error);
                        discountElement.textContent = "$0.00";
                        updateCalculations(subtotal, discount);
                    });
            } else {
                discountElement.textContent = "$0.00";
                updateCalculations(subtotal, discount);
            }
        });

        // tip calculation
        tipBtns.forEach((button) => {
            button.addEventListener("click", function () {
                let tip = button.getAttribute("data-value");
                updateCalculations(subtotal, discount, tip)
            });
        });

        cashInput.addEventListener("input", () => {
            let cash = parseFloat(cashInput.value.replace("$", ""));
            if (isNaN(cash)) cash = 0;
            const change = cash - total;
            changeElement.textContent = "$ " + change.toFixed(2);
        });
    })
    .catch((error) => {
        console.log(error);
    });
