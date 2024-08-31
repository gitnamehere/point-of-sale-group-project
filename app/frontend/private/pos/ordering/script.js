const categoryList = document.getElementById("categories");
const itemGrid = document.getElementById("items");
const ticketTable = document.getElementById("ticket-table");
const subtotal = document.getElementById("subtotal");
const total = document.getElementById("total");
const deleteItemButton = document.getElementById("delete-item");
const clearOrderButton = document.getElementById("clear");
const orderButton = document.getElementById("order");

// map of items in order stored as item id: quantity
let order = {};
let selectedItem = {};

function fetchItemsByCategoryId(id) {
    fetch(`/api/items?category=${id}`)
        .then((response) => {
            if (response.status > 200)
                return alert("Error while selecting category");

            return response
                .json()
                .then((body) => {
                    itemGrid.textContent =
                        body.length > 0 ? "" : "No Items Found";

                    for (let i = 0; i < body.length; i++) {
                        const item = document.createElement("div");

                        const itemName = document.createElement("p");
                        itemName.textContent = body[i].name;
                        item.append(itemName);

                        const itemPrice = document.createElement("p");
                        itemPrice.textContent = `$${body[i].price}`;
                        item.append(itemPrice);

                        item.className = "item";
                        item.addEventListener("click", () =>
                            addItemToOrder(body[i]),
                        );

                        itemGrid.append(item);
                    }
                })
                .catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));
}

function selectItem(itemRow, id) {
    const currentSelectedItem =
        document.getElementsByClassName("item-selected");

    if (currentSelectedItem.length > 0)
        currentSelectedItem[0].classList.remove("item-selected");

    itemRow.classList.add("item-selected");
    selectedItem.id = id;
    selectedItem.node = itemRow;
    deleteItemButton.disabled = false;
    // TODO: add future code here to do stuff with the selected item
}

function addItemToOrder(item) {
    const { id, name, price } = item;

    if (order.hasOwnProperty(id)) {
        const itemRow = document.getElementById(id);

        // increment quantity (conveniently, it works even though it's a string)
        itemRow.children[0].textContent++;
        order[id] = parseInt(itemRow.children[0].textContent);
        // also multiple price by quantity
        // if anyone wants to know what toFixed() does https://www.w3schools.com/jsref/jsref_tofixed.asp
        itemRow.children[2].textContent = (
            price * itemRow.children[0].textContent
        ).toFixed(2);
    } else {
        // add item to order with a quantity of 1
        order[id] = 1;

        const itemRow = document.createElement("tr");
        itemRow.id = id; // set the table row's id to the item id for later use

        const itemQuantity = document.createElement("td");
        itemQuantity.textContent = "1";
        itemRow.append(itemQuantity);

        const itemName = document.createElement("td");
        itemName.textContent = name;
        itemRow.append(itemName);

        const itemPrice = document.createElement("td");
        itemPrice.style.textAlign = "right";
        itemPrice.textContent = price;

        itemRow.addEventListener("click", () => selectItem(itemRow, id));
        itemRow.append(itemPrice);
        ticketTable.append(itemRow);
    }

    updateTotals();
}

function updateTotals() {
    const items = ticketTable.children;
    let subtotalCount = 0;

    for (let i = 0; i < items.length; i++) {
        // have to use parseFloat or it will concatenate strings
        subtotalCount =
            subtotalCount + parseFloat(items[i].children[2].textContent);
    }

    subtotal.textContent = subtotalCount.toFixed(2);
    // also update total since we aren't handling taxes yet
    total.textContent = subtotalCount.toFixed(2);
}

function clearOrder() {
    ticketTable.textContent = "";
    order = {};
    selectedItem = {};
    deleteItemButton.disabled = true;
    updateTotals();
}

deleteItemButton.addEventListener("click", () => {
    if (selectedItem.hasOwnProperty("id")) {
        selectedItem.node.remove();
        // https://www.w3schools.com/howto/howto_js_remove_property_object.asp
        delete order[selectedItem.id];
        selectedItem = {};
        updateTotals();
    }

    deleteItemButton.disabled = true;
});

clearOrderButton.addEventListener("click", () => clearOrder());

orderButton.addEventListener("click", () => {
    if (Object.keys(order).length === 0) return;

    fetch("/api/orders/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            order,
            subtotal: subtotal.textContent,
        }),
    })
        .then((response) => {
            if (response.status === 200) {
                alert("Order placed!");
                clearOrder(); // in case the user presses the back button
                window.location = "/pos/orders";
            } else {
                alert("An error occured");
            }
        })
        .catch((error) => console.log(error));
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

                // populate item grid with first category
                body.length > 0
                    ? fetchItemsByCategoryId(body[0].id)
                    : alert("No Categories Found");
            })
            .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
