console.log("Hello World!");

let categories = document.getElementById("categories");

for (let i = 0; i < 25; i++) {
    let category = document.createElement("div");
    category.className = "category-item"
    category.textContent = ("Example Category " + (i + 1));

    categories.appendChild(category);
}
