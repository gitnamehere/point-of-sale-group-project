const orders = document.getElementById("orders");

function totalQuantity(items) {
    let total = 0;
    for (let i in items) {
        total += items[i];
    }
    return total;
}

fetch("/api/orders")
    .then((response) => {
        return response.json();
    })
    .then((body) => {
        for (let order of body) {
            const squareButton = document.createElement("a");
            squareButton.href = `/pos/payment?id=${order.id}`
            // there are placeholders since there isn't much information yet
            squareButton.innerHTML = `
                <div class="order-button btn btn-light">
                    <div>Order #${order.id}</div>
                    <div>Michael</div>
                    <div>Subtotal: $${order.subtotal}</div>
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
