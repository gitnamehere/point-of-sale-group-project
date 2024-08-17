const orders = document.getElementById("orders");

function totalQuantity(items) {
	let total = 0;
	for (let i in items) {
		total+=items[i];
	}
	return total;
}

fetch("/api/orders")
	.then((response) => {
		return response.json();
	})
	.then((body) => {
		for (let order of body) {
			const tr = document.createElement("tr");
			// there are placeholders since there isn't much information yet
			tr.innerHTML = `
				<td>${order.id}</td>
				<td></td>
				<td>Michael</td>
				<td>${totalQuantity(order.items)}</td>
				<td>$${order.subtotal}</td>
				<td></td>
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

			tr.addEventListener("click", () => {
				detailTr.classList.toggle("show");

				const tbody = detailTr.querySelector("tbody");
				if (tbody.children.length === 0) {
					const itemIds = Object.keys(order.items);

					for (let i = 0; i < itemIds.length; i++) {
						let id = itemIds[i];

						fetch(`/api/items/${id}`)
							.then((response) => {
								return response.json();
							})
							.then((body) => {
								const itemRow = document.createElement("tr");
								itemRow.innerHTML = `
									<td>${body[0].id}</td>
									<td>${body[0].name}</td>
									<td>${order.items[id]}</td>
									<td>$${(body[0].price*order.items[id]).toFixed(2)}</td>
								`;
								tbody.appendChild(itemRow);
							})
							.catch((error) => {
								console.log(error);
							}) 
					}
				}
			});

			orders.append(tr);
			orders.appendChild(detailTr);
		}
	})
	.catch((error) => {
		console.log(error);
	})