// item information
const catInput = document.getElementById("category");
const itemsTable = document.getElementById("items");
const nameInput = document.getElementById("name");
const descInput = document.getElementById("description");
const priceInput = document.getElementById("price");
let selectedItemId = null;

// buttons
const apply = document.getElementById("submit");
const update = document.getElementById("update");
const del = document.getElementById("delete");

let message = document.getElementById("message");

function clearTable() {
    const table = document.getElementById("items");
    let length = table.children.length;
    if (length > 1) {
        for (let i = length-1; i > 0; i--) {
            table.children[i].remove();
        }
    }
}

function resetInputs() {
    nameInput.value = "";
    descInput.value = "";
    priceInput.value = "";
}

// display item_category
fetch("/api/item/categories")
    .then(response => {
        return response.json();
    })
    .then(body => {
        for (let i = 0; i < body.length; i++) {
            const category = body[i];
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            catInput.append(option);
        }
    })
    .catch(error => {
        console.log(error);
    });

// display items based on selected category
apply.addEventListener("click", () => {
    const category = catInput.value;

    fetch(`/api/items?category=${category}`)
        .then(response => {
            return response.json()
        })
        .then(body => {
            message.textContent = "";
            selectedItemId = null;
            clearTable();
            resetInputs();
            for (let item of body) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td>$${item.price}</td>
                `;
                tr.addEventListener("click", () => {
                    selectedItemId = item.id;
                    nameInput.value = item.name;
                    descInput.value = item.description;
                    priceInput.value = item.price;
                });
                itemsTable.append(tr);
            }
        })
        .catch(error => {
            console.log(error)
        });
});

// update the selected item
update.addEventListener("click", () => {
    if (!selectedItemId) {
        message.textContent = "No item selected for editing";
        return;
    }

    const item = {
        name: nameInput.value,
        description: descInput.value,
        price: priceInput.value
    };

    fetch(`/api/items/${selectedItemId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
    })
    .then(response => {
        message.textContent = (response.ok ? "Item has been modified" : "Item could not be modified");
    })
    .catch(error => {
        console.log(error)
    });
});

// delete the selected item
del.addEventListener("click", () => {
    if (!selectedItemId) {
        message.textContent = "No item selected for editing";
        return;
    }

    fetch(`/api/items/${selectedItemId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify()
    })
    .then(response => {
        message.textContent = (response.ok ? "Item has been deleted" : "Item could not be deleted");
    })
    .catch(error => {
        console.log(error)
    });
});
