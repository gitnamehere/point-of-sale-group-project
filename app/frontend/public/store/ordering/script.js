const cartTable = document.getElementById("ticket-table");
const itemGrid = document.getElementById("items");
const categoryList = document.getElementById("categories");
const cartSubtotal = document.getElementById("subtotal");
const cartTotal = document.getElementById("total");
const removeItemButton = document.getElementById("delete-item");
const clearCartButton = document.getElementById("clear");
const checkoutButton = document.getElementById("order");

let cart = {};
let selectedCartItem = {};

function fetchItemsByCategoryId(id) {
    fetch(`/api/items?category=${id}`)
        .then((response) => {
            if (!response.ok) {
                alert("Error fetching items for the selected category");
                return;
            }
            return response.json();
        })
        .then((items) => {
            itemGrid.textContent = items.length > 0 ? "" : "No Items Found";

            items.forEach((item) => {
                const itemElement = document.createElement("div");
                itemElement.className = "item";

                const itemName = document.createElement("p");
                itemName.textContent = item.name;
                itemElement.appendChild(itemName);

                const itemPrice = document.createElement("p");
                itemPrice.textContent = `$${parseFloat(item.price).toFixed(2)}`;
                itemElement.appendChild(itemPrice);

                itemElement.addEventListener("click", () =>
                    addItemToCart(item),
                );
                itemGrid.appendChild(itemElement);
            });
        })
        .catch((error) => console.error("Error:", error));
}

function selectCartItem(itemRow, id) {
    const currentSelectedItem =
        document.getElementsByClassName("item-selected");

    if (currentSelectedItem.length > 0)
        currentSelectedItem[0].classList.remove("item-selected");

    itemRow.classList.add("item-selected");
    selectedCartItem.id = id;
    selectedCartItem.node = itemRow;
    removeItemButton.disabled = false;
}

function addItemToCart(item) {
    const { id, name, price } = item;
    const numericPrice = parseFloat(price);

    if (cart[id]) {
        const itemRow = document.getElementById(id);
        itemRow.children[0].textContent++;
        cart[id].quantity++;
        itemRow.children[2].textContent = (
            numericPrice * cart[id].quantity
        ).toFixed(2);
    } else {
        cart[id] = { quantity: 1, name, price: numericPrice };

        const itemRow = document.createElement("tr");
        itemRow.id = id;

        const quantityCell = document.createElement("td");
        quantityCell.textContent = "1";
        itemRow.appendChild(quantityCell);

        const nameCell = document.createElement("td");
        nameCell.textContent = name;
        itemRow.appendChild(nameCell);

        const priceCell = document.createElement("td");
        priceCell.style.textAlign = "right";
        priceCell.textContent = numericPrice.toFixed(2);
        itemRow.appendChild(priceCell);

        itemRow.addEventListener("click", () => selectCartItem(itemRow, id));
        cartTable.appendChild(itemRow);
    }

    updateCartTotals();
}

function updateCartTotals() {
    let subtotal = 0;
    const taxRate = 0.08; // Assuming just philly right now

    for (const itemId in cart) {
        const item = cart[itemId];
        subtotal += item.price * item.quantity;
    }

    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    cartSubtotal.textContent = subtotal.toFixed(2);
    document.getElementById("taxes").textContent = tax.toFixed(2);
    cartTotal.textContent = total.toFixed(2);
}

removeItemButton.addEventListener("click", () => {
    if (selectedCartItem.id) {
        selectedCartItem.node.remove();
        delete cart[selectedCartItem.id];
        selectedCartItem = {};
        updateCartTotals();
        removeItemButton.disabled = true;
    }
});

clearCartButton.addEventListener("click", () => {
    cartTable.textContent = "";
    cart = {};
    selectedCartItem = {};
    updateCartTotals();
    removeItemButton.disabled = true;
});

fetch("/api/item/categories")
    .then((response) => {
        if (response.status > 200) return alert("Error while fetching items");

        response
            .json()
            .then((body) => {
                for (let i = 0; i < body.length; i++) {
                    const category = document.createElement("div");
                    category.className = "category-item";
                    category.textContent = body[i].name;
                    category.addEventListener("click", () =>
                        fetchItemsByCategoryId(body[i].id),
                    );

                    categoryList.appendChild(category);
                }

                body.length > 0
                    ? fetchItemsByCategoryId(body[0].id)
                    : alert("No Categories Found");
            })
            .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
