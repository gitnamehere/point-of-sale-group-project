const categoryList = document.getElementById("categoryList");
const itemTable = document.getElementById("items")

function displayItemsFromCategory(id) {
    fetch(`/api/items?category=${id}`)
        .then((response) => {
            return response.json()
        })
        .then((body) => {          
            itemTable.innerHTML = "";
            
            let row = document.createElement("div");
            row.className = "row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3";

            for (let item of body) {
                let col = document.createElement("div");
                let card = document.createElement("div");
                let cardBody = document.createElement("div");

                col.className = "col";
                card.className = "card h-100";
                cardBody.className = "card-body";

                cardBody.innerHTML = `
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.description}</p>
                    <p class="card-text"><strong>Price: $${item.price}</strong></p>
                    <button class="btn btn-primary">Add to Cart</button>
                `;

                card.appendChild(cardBody);
                col.appendChild(card);
                row.appendChild(col);
            }

            itemTable.appendChild(row);
        })
        .catch((error) => {
            console.log(error);
        });
}

fetch("/api/item/categories")
    .then((response) => {
        return response.json();
    })
    .then((body) => {
		for (let category of body) {
			const li = document.createElement("li");
            li.className = "nav-item";
            const a = document.createElement("a");
            a.className = "nav-link";
            a.href = "#";
            a.textContent = category.name;
            a.style.color = "black";

            a.addEventListener("click", function() {
                const links = document.querySelectorAll(".nav-link");
                for (let i = 0; i < links.length; i++) {
                    links[i].classList.remove("selected");
                }
                a.classList.add("selected");

                displayItemsFromCategory(category.id);
            });

            li.appendChild(a);
            categoryList.appendChild(li)
		}

        if (body.length > 0) {
            const firstCategoryLink = categoryList.querySelector('.nav-link');
            displayItemsFromCategory(1);
        }
    })
    .catch((error) => {
        console.log(error);
    });