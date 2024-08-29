// need to implement image adding and discount percentage


// item information
const catInput = document.getElementById("category");
const nameInput = document.getElementById("name");
const descInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const fileInput = document.getElementById("csv");

// buttons
const create = document.getElementById("submit");
const upload = document.getElementById("upload");

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

    console.log("selected category:", catInput.value)

    fetch("/api/item/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
    })
        .then((response) => {
            response.ok ? alert("Success") : alert("Failure");
        })
        .catch((error) => {
            console.log(error);
        });
});

upload.addEventListener("click", () => {
    const file = new FormData();
    file.append("file", fileInput.files[0]);

    fetch("/api/item/upload", {
        method: "POST",
        body: file,
    })
    .then(async (response) => {
        const result = await response.json();
        console.log(result.data);
    })
    .catch((error) => {
        console.log(error);
    });
});
