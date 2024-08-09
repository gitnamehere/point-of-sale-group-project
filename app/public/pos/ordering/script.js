console.log("Hello World!");

const categoryList = document.getElementById("categories");
const itemGrid = document.getElementById("items");

let categories = ["Example 1", "Example 2", "Example 3", "Example 4"];

for (let i = 0; i < categories.length; i++) {
    let category = document.createElement("div");
    category.className = "category-item"
    category.textContent = categories[i];

    category.addEventListener("click", () => {
        alert(`Clicked on Category: ${i + 1}!`);
    })

    categoryList.appendChild(category);
}
