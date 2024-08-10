console.log("Hello World!");

const categoryList = document.getElementById("categories");
const itemGrid = document.getElementById("items");
const ticketTable = document.getElementById("ticket-table");

let order = [];

function fetchItemsByCategoryId(id) {
    fetch(`/api/items?category=${id}`)
    .then(response => {
        if (response.status > 200) return alert("Error while selecting category");

        return response.json()
        .then(body => {
            itemGrid.textContent = (body.length > 0) ? "" : "No Items Found";

            for (let i = 0; i < body.length; i++) {
                let item = document.createElement("div");
                item.textContent = body[i].name;
                item.className = "item";
                item.addEventListener("click", () => addItemToOrder(body[i]));

                itemGrid.append(item);
            }
        })
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
}

function addItemToOrder(item) {
    let {name, price} = item;

    order.push(item);

    let itemRow = document.createElement("tr");
    let itemQuantity = document.createElement("td");
    itemQuantity.textContent = "1";
    itemRow.append(itemQuantity);
    let itemName = document.createElement("td");
    itemName.textContent = name;
    itemRow.append(itemName);
    let itemPrice = document.createElement("td");
    itemPrice.textContent = `$${price}`;
    itemRow.append(itemPrice);

    ticketTable.append(itemRow);
}

fetch("/api/item/categories")
.then(response => {
    if (response.status > 200) return alert("Error while fetching items");

    response.json().then(body => {
        for (let i = 0; i < body.length; i++) {
            let category = document.createElement("div");
            category.className = "category-item";
            category.textContent = body[i].name;
            category.addEventListener("click", () => fetchItemsByCategoryId(body[i].id));

            categoryList.appendChild(category);
        }

        // populate item grid with first category
        fetchItemsByCategoryId(body[0].id);
    })
    .catch(error => console.log(error))
})
.catch(error => console.log(error))
