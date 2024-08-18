// item information
const catInput = document.getElementById("category");
const itemTable = document.querySelector(".items");
const nameInput = document.getElementById("name");
const descInput = document.getElementById("description");
const priceInput = document.getElementById("price");
let selectedItemId = null;

// buttons
const apply = document.getElementById("submit");
const update = document.getElementById("update");
const del = document.getElementById("delete");

function resetInputs() {
    nameInput.value = "";
    descInput.value = "";
    priceInput.value = "";
}

// display item_category
fetch("/api/item/categories")
    .then((response) => {
        return response.json();
    })
    .then((body) => {
        for (let i = 0; i < body.length; i++) {
            const category = body[i];
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            catInput.append(option);
        }
    })
    .catch((error) => {
        console.log(error);
    });

// display items based on selected category
apply.addEventListener("click", () => {
    const category = catInput.value;

    fetch(`/api/items?category=${category}`)
        .then((response) => {
            return response.json();
        })
        .then((body) => {
            itemTable.innerHTML = "";
            selectedItemId = null;
            resetInputs();

            for (let item of body) {
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("item");
                itemDiv.textContent = item.name;

                itemDiv.addEventListener("click", () => {
                    selectedItemId = item.id;
                    nameInput.value = item.name;
                    descInput.value = item.description;
                    priceInput.value = item.price;
                });

                itemTable.append(itemDiv);
            }
        })
        .catch((error) => {
            console.log(error);
        });
});

// update the selected item
update.addEventListener("click", () => {
    if (!selectedItemId) {
        alert("No item selected for editing");
        return;
    }

    const item = {
        name: nameInput.value,
        description: descInput.value,
        price: priceInput.value,
    };

    fetch(`/api/items/${selectedItemId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
    })
        .then((response) => {
            if (response.ok) {
                alert("Item has been modified");
                selectedItemId = null;
                apply.click();
                resetInputs();
            } else {
                alert("Item could not be modified");
            }
        })
        .catch((error) => {
            console.log(error);
        });
});

// delete the selected item
del.addEventListener("click", () => {
    if (!selectedItemId) {
        alert("No item selected for editing");
        return;
    }

    fetch(`/api/items/${selectedItemId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(),
    })
        .then((response) => {
            if (response.ok) {
                alert("Item has been deleted");
                selectedItemId = null;
                apply.click();
                resetInputs();
            } else {
                alert("Item could not be deleted");
            }
        })
        .catch((error) => {
            console.log(error);
        });
});
