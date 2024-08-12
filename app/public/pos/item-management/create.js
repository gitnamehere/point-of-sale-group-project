// item information
const catInput = document.getElementById("category");
const nameInput = document.getElementById("name");
const descInput = document.getElementById("description");
const priceInput = document.getElementById("price");

// buttons
const create = document.getElementById("submit");

const message = document.getElementById("message");

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

// handle item data sent to the backend
create.addEventListener("click", () => {
    const item = {
        category: catInput.value,
        name: nameInput.value,
        description: descInput.value,
        price: priceInput.value,
    };

    fetch("/api/item/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
    })
        .then((response) => {
            message.textContent = response.ok ? "Success" : "Failure";
        })
        .catch((error) => {
            console.log(error);
        });
});
