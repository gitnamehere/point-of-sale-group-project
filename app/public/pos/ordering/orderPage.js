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
				<td>${order.subtotal}</td>
				<td></td>
            `;
			tr.addEventListener("click", () => {
				selectedItemId = item.id;
				nameInput.value = item.name;
				descInput.value = item.description;
				priceInput.value = item.price;
			});
			orders.append(tr);
		}
	})
	.catch((error) => {
		console.log(error);
	})