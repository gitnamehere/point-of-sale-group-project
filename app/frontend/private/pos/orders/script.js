const orders = document.getElementById("orders");
const filterSelect = document.getElementById("filter");

function totalQuantity(items) {
    let total = 0;
    for (let i in items) {
        total += items[i];
    }
    return total;
}

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
filterSelect.addEventListener("change", () => {
    fetchOrders(filterSelect.value);
});

function fetchOrders(filter) {
    orders.textContent = "";

    fetch(`/api/orders?filter=${filter}`)
        .then((response) => {
            return response.json();
        })
        .then((body) => {
            for (let order of body) {
                const squareButton = document.createElement("a");
                squareButton.href = `/pos/payment?id=${order.id}`;
                // there are placeholders since there isn't much information yet
                squareButton.innerHTML = `
                <div class="order-button ${order.is_void ? "void" : ""} ${order.is_paid && !order.is_void ? "paid" : ""} btn btn-light">
                    ${order.is_void ? "<div>VOIDED</div>" : ""}
                    <div><b>Order #${order.id}</b></div>
                    <div>Michael</div>
                    <div>$${order.total}</div>
                </div>
            `;

                const detailTr = document.createElement("tr");
                detailTr.classList.add("collapse");
                detailTr.innerHTML = `
                <td colspan="6">
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

                orders.append(squareButton);
                orders.appendChild(detailTr);
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

// default to show unpaid orders
fetchOrders("unpaid");
