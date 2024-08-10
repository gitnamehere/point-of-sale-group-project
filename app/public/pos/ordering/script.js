const categoryList = document.getElementById("categories");
const itemGrid = document.getElementById("items");
const ticketTable = document.getElementById("ticket-table");
const subtotal = document.getElementById("subtotal");
const orderButton = document.getElementById("order");

// map of items in order stored as item id: quantity
let order = {};

function fetchItemsByCategoryId(id) {
    fetch(`/api/items?category=${id}`)
    .then(response => {
        if (response.status > 200) return alert("Error while selecting category");

        return response.json()
        .then(body => {
            itemGrid.textContent = (body.length > 0) ? "" : "No Items Found";

            for (let i = 0; i < body.length; i++) {
                const item = document.createElement("div");
                item.textContent = body[i].name;
                item.className = "item";
                item.addEventListener("click", () => addItemToOrder(body[i]));

                itemGrid.append(item);
            }
        })
        .catch(error => console.log(error));
    })
    .catch(error => console.log(error));
}

function addItemToOrder(item) {
    const {id, name, price} = item;

    if (order.hasOwnProperty(id)) {
        const itemRow = document.getElementById(id);
        
        // increment quantity (conveniently, it works even though it's a string)
        itemRow.children[0].textContent++;
        // also multiple price by quantity
        // if anyone wants to know what toFixed() does https://www.w3schools.com/jsref/jsref_tofixed.asp
        itemRow.children[2].textContent = (price * itemRow.children[0].textContent).toFixed(2);
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
        itemRow.append(itemPrice);

        ticketTable.append(itemRow);
    }

    updateSubtotal();
}

function updateSubtotal() {
    let subtotalCount = 0;
    let items = ticketTable.children;

    for (let i = 0; i < items.length; i++) {
        // have to use parseFloat or it will concatenate strings
        subtotalCount = subtotalCount + parseFloat(items[i].children[2].textContent);
    }

    subtotal.textContent = subtotalCount.toFixed(2);
}

orderButton.addEventListener("click", () => {
    fetch("/api/order/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({order})
    })
    .then(response => console.log(response))
    .catch(error => console.log(error));
});

fetch("/api/item/categories")
.then(response => {
    if (response.status > 200) return alert("Error while fetching items");

    response.json().then(body => {
        for (let i = 0; i < body.length; i++) {
            const category = document.createElement("div");
            category.className = "category-item";
            category.textContent = body[i].name;
            category.addEventListener("click", () => fetchItemsByCategoryId(body[i].id));

            categoryList.appendChild(category);
        }

        // populate item grid with first category
        body.length > 0 ? fetchItemsByCategoryId(body[0].id) : alert("No Categories Found");
    })
    .catch(error => console.log(error));
})
.catch(error => console.log(error));
