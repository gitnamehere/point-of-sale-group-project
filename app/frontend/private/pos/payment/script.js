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
const clearBtn = document.getElementById("clear");
const payBtn = document.getElementById("payButton");
let discountPercentage = 0;
let tipPercentage = 0;
let change = 0;
let isPaid = false; // for now until ordering screen handles payment status

numPadBtns.forEach((button) => {
    button.addEventListener("click", function () {
        let value = button.getAttribute("data-value");
        let currentValue = cashInput.value.replace("$", "").replace(".", "");

        if (!currentValue) {
            currentValue = "0";
        }

        currentValue = currentValue + value;
        let amount = parseFloat(currentValue) / 100;
        cashInput.value = `$ ${amount.toFixed(2)}`;
    });
});

clearBtn.addEventListener("click", function () {
    cashInput.value = "$0.00";
});

function updateCalculations(subtotal, discount, tip) {
    discountAmount = subtotal * discount;
    const discountedSubtotal = subtotal - discountAmount;
    tipAmount = subtotal * tip;
    const taxAmount = discountedSubtotal * tax;
    total = discountedSubtotal * (1 + tax) + tipAmount;

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
        updateCalculations(subtotal, discountPercentage, tipPercentage);

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
                        discountPercentage = data[0].discount;
                        discountElement.textContent = `$ ${discountPercentage.toFixed(2)}`;
                        updateCalculations(subtotal, discountPercentage);
                    })
                    .catch((error) => {
                        console.log(error);
                        discountElement.textContent = "$0.00";
                        updateCalculations(
                            subtotal,
                            discountPercentage,
                            tipPercentage,
                        );
                    });
            } else {
                discountElement.textContent = "$0.00";
                updateCalculations(subtotal, discountPercentage, tipPercentage);
            }
        });

        // tip calculation
        tipBtns.forEach((button) => {
            button.addEventListener("click", function () {
                let tipPercentage = button.getAttribute("data-value");
                updateCalculations(subtotal, discountPercentage, tipPercentage);
            });
        });

        payBtn.addEventListener("click", () => {
            let cash = parseFloat(cashInput.value.replace("$", ""));
            const change = cash - total.toFixed(2);
            changeElement = "$ " + change.toFixed(2);

            if (cash < total.toFixed(2)) {
                alert("Error: Payment was not fulfilled");
                return;
            } else {
                const orderDetails = { discountAmount, tipAmount, total };
                console.log(orderDetails);
                fetch(`/api/orders/process/${orderId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(orderDetails),
                })
                    .then((response) => {
                        response.ok
                            ? alert(`Your change is $${change.toFixed(2)}`)
                            : alert("Error: Payment could not be processed");
                    })
                    .catch((error) => console.log(error));
            }
        });
    })
    .catch((error) => {
        console.log(error);
    });
