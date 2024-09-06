const tax = 0.08; // holding for dev use - will need to implement business owner customization

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
const totalElement = document.getElementById("total");
const amountDue = document.getElementById("amountDue");
const cashInput = document.getElementById("cashInput");
const numPadBtns = document.querySelectorAll(".num-btn");
const clearBtn = document.getElementById("clear");
const payBtn = document.getElementById("payButton");
const paidBtn = document.getElementById("paidButton");
const voidBtn = document.getElementById("voidButton");
const refundBtn = document.getElementById("refundButton");
const grandTotal = document.getElementById("grandTotal");
const amountPaid = document.getElementById("amountPaid");
const changeElement = document.getElementById("change");
const orders = document.getElementById("orders");

let discountPercentage = 0;
let tipPercentage = 0;

function formatCurrency(value) {
    return `$ ${value.toFixed(2)}`;
}

function fetchOrder(orderId) {
    return fetch(`/api/orders/${orderId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => response.json());
}

function fetchDiscount(code) {
    return fetch(`/api/discounts/${code}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => response.json());
}

function fetchItem(itemId) {
    return fetch(`/api/items/${itemId}`).then((response) => response.json());
}

function updateCalculations(subtotal, discount, tip) {
    discountAmount = subtotal * discount;
    const discountedSubtotal = subtotal - discountAmount;
    tipAmount = subtotal * tip;
    const taxAmount = discountedSubtotal * tax;
    total = discountedSubtotal * (1 + tax) + tipAmount;

    discountElement.textContent = formatCurrency(discountAmount);
    tipElement.textContent = formatCurrency(tipAmount);
    taxElement.textContent = formatCurrency(taxAmount);
    totalElement.textContent = formatCurrency(total);
    amountDue.textContent = formatCurrency(total);
}

function handleDiscountButton(subtotal) {
    const code = discountInput.value.trim();

    if (code) {
        fetchDiscount(code)
            .then((data) => {
                discountPercentage = data[0].discount;
                updateCalculations(subtotal, discountPercentage, tipPercentage);
            })
            .catch((error) => {
                console.log(error);
                discountElement.textContent = "$0.00";
                updateCalculations(subtotal, discountPercentage, tipPercentage);
            });
    } else {
        discountElement.textContent = "$0.00";
        updateCalculations(subtotal, discountPercentage, tipPercentage);
    }
}

function handleTip(subtotal, event) {
    tipPercentage = parseFloat(event.target.getAttribute("data-value"));
    updateCalculations(subtotal, discountPercentage, tipPercentage);
}

function handlePaymentButton() {
    const orderDetails = {
        discountAmount: discountPercentage,
        tipAmount: tipPercentage,
        total,
    };
    const cash = parseFloat(cashInput.value.replace("$", ""));
    const change = cash - total;

    if (cash < total.toFixed(2)) {
        console.log(total);
        alert(
            "Error: Payment amount is less than total. Please enter a sufficient amount.",
        );
        return;
    } else {
        grandTotal.textContent = formatCurrency(total);
        amountPaid.textContent = formatCurrency(cash);
        changeElement.textContent = formatCurrency(change);

        const payModal = new bootstrap.Modal(
            document.getElementById("payModal"),
        );
        payModal.show();

        paidBtn.addEventListener("click", () => {
            fetch(`/api/orders/process/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderDetails),
            })
                .then((response) => {
                    if (response.ok) {
                        window.location = "/pos/orders/";
                    } else {
                        alert("Error: Payment could not be processed");
                    }
                })
                .catch((error) => {
                    console.log("Error:", error);
                    alert("Error: Payment could not be processed");
                });
        });
    }
}

function handleVoidButton() {
    fetch(`/api/orders/void/${orderId}`, {
        method: "PUT",
    })
        .then((response) => {
            if (response.ok) {
                window.location = "/pos/orders/";
            } else {
                alert("Error: Order could not be voided");
            }
        })
        .catch((error) => {
            console.log("Error:", error);
            alert("Error: Order could not be voided");
        });
}

function handleRefundButton() {
    fetch(`/api/orders/refund/${orderId}`, {
        method: "PUT",
    })
        .then((response) => {
            if (response.ok) {
                window.location = "/pos/orders/";
            } else {
                alert("Error: Order could not be refunded");
            }
        })
        .catch((error) => {
            console.log("Error:", error);
            alert("Error: Order could not be refunded");
        });
}

function initialize() {
    fetchOrder(orderId)
        .then((data) => {
            const subtotal = parseFloat(data[0].subtotal);
            subtotalElement.textContent = formatCurrency(subtotal);

            updateCalculations(subtotal, discountPercentage, tipPercentage);

            discountBtn.addEventListener("click", () =>
                handleDiscountButton(subtotal),
            );
            tipBtns.forEach((button) =>
                button.addEventListener("click", (event) =>
                    handleTip(subtotal, event),
                ),
            );
            voidBtn.addEventListener("click", handleVoidButton);
            refundBtn.addEventListener("click", handleRefundButton);
            payBtn.addEventListener("click", handlePaymentButton);

            data.forEach((order) => {
                const detailTr = document.createElement("tr");
                detailTr.innerHTML = `
                <td colspan="4">
                    <table class="table table-striped" id="${order.id}">
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

                const tbody = detailTr.querySelector("tbody");
                const itemIds = Object.keys(order.items);

                itemIds.forEach((id) => {
                    fetchItem(id)
                        .then((body) => {
                            const itemRow = document.createElement("tr");
                            itemRow.innerHTML = `
                            <td>${body[0].id}</td>
                            <td>${body[0].name}</td>
                            <td>${order.items[id]}</td>
                            <td>$${(body[0].price * order.items[id]).toFixed(2)}</td>
                        `;
                            tbody.appendChild(itemRow);
                        })
                        .catch((error) => console.error(error));
                });
                orders.appendChild(detailTr);
            });
        })
        .catch((error) => console.error(error));
}

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

initialize();
