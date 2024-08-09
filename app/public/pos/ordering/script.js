console.log("Hello World!");

const categoryList = document.getElementById("categories");
const itemGrid = document.getElementById("items");

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
                item.addEventListener("click", () => console.log(`Item Data: ${JSON.stringify(body[i])}`));

                itemGrid.append(item);
            }
        })
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
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
