const categoryList = document.getElementById("categoryList");
const itemTable = document.getElementById("items");
const filterSelect = document.getElementById("filterSelect");

let currentToast = null;

function displayItemsFromCategory(id) {
    fetch(`/api/items?category=${id}`)
        .then((response) => {
            return response.json();
        })
        .then((body) => {
            const sortOption = filterSelect.value;
            if (sortOption === "1") {
                body.sort((a, b) => b.price - a.price);
            } else if (sortOption === "2") {
                body.sort((a, b) => a.price - b.price);
            }

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

                const addToCartButton = cardBody.querySelector(".btn.btn-primary");
                addToCartButton.addEventListener("click", () => {
                    updateCart(item.id);
                });
            }

            itemTable.appendChild(row);
        })
        .catch((error) => {
            console.log(error);
        });
}

function updateCart(id) {
    fetch("/api/cart/items")
        .then((response) => {
            return response.json();
        })
        .then((body) => {
            console.log(body);

            if (!checkItemId(body, id)) {
                fetch("/api/cart/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({item_id: id, quantity: 1}),
                })
                .then((response) => {
                    response.ok ? showToast() : console.log("Item was not added");
                })
                .catch((error) => {
                    console.log(error);
                })
            }
            else {
                const newQuantity = returnQuantity(body, id) + 1;

                fetch(`/api/cart/update/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({quantity: newQuantity}),
                })
                .then((response) => {
                    response.ok ? showToast() : console.log("Item was not added");
                })
                .catch((error) => {
                    console.log(error);
                });
            }
        })
        .catch((error) => {
            console.log(error);
        })
}

function checkItemId(cart, item_id) {
    for (item of cart) {
        if (item.item_id === item_id) {
            return true;
        }
    }
    return false;
}

function returnQuantity(cart, item_id) {
    for (item of cart) {
        if (item.item_id === item_id) {
            return item.quantity;
        }
    }
}

function showToast() {
    const toastEl = document.getElementById("cartToast");

    if (currentToast) {
        currentToast.dispose();
    }

    const newToastEl = toastEl.cloneNode(true);
    toastEl.parentNode.replaceChild(newToastEl, toastEl);
    
    currentToast = new bootstrap.Toast(newToastEl, {
        autohide: true,
        delay: 1500
    });

    currentToast.show();
}

function displayCartItems() {
    fetch("/api/cart/items")
        .then((response) => response.json())
        .then((cart) => {
            console.log(cart)
            const cartItemsContainer = document.getElementById("cartItems");
            cartItemsContainer.innerHTML = "";

            if (cart.length === 0) {
                cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
            } 
            else {
                const itemPromises = cart.map(item => 
                    fetch(`/api/items/${item.item_id}`).then(response => response.json())
                );

                Promise.all(itemPromises)
                    .then((itemsDetails) => {
                        let subtotal = 0;

                        itemsDetails.forEach((itemDetail, index) => {
                            const item = cart[index];
                            const id = item.item_id;
                            const quantity = item.quantity;
                            const itemTotalPrice = itemDetail[0].price * quantity;

                            subtotal += itemTotalPrice;

                            const itemElement = document.createElement("div");
                            itemElement.className = "cart-item mb-3";
                            itemElement.innerHTML = `
                                <h6>${itemDetail[0].name}</h6>
                                <div class="quantity-control">
                                    <button class="btn btn-sm btn-secondary decrease-btn">-</button>
                                    <input type="number" class="form-control form-control-sm quantity-input" value="${quantity}" min="1" style="width: 60px; display: inline-block;">
                                    <button class="btn btn-sm btn-secondary increase-btn">+</button>
                                </div>
                                <p>Price: $<span class="item-price">${itemTotalPrice.toFixed(2)}</span></p>
                                <button class="btn btn-danger btn-sm remove-btn">Remove</button>
                            `;
                            cartItemsContainer.appendChild(itemElement);

                            const quantityInput = itemElement.querySelector(".quantity-input");
                            const decreaseBtn = itemElement.querySelector(".decrease-btn");
                            const increaseBtn = itemElement.querySelector(".increase-btn");
                            const itemPrice = itemElement.querySelector(".item-price");
                            const removeButton = itemElement.querySelector(".remove-btn");

                            function updateQuantity(newQuantity) {
                                if (newQuantity < 1) newQuantity = 1;
                                quantityInput.value = newQuantity;
                                itemPrice.textContent = (itemDetail[0].price * newQuantity).toFixed(2);

                                fetch(`/api/cart/update/${id}`, {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({quantity: newQuantity}),
                                })
                                .then(response => {
                                    if (!response.ok) {
                                        console.log("Failed to update");
                                    }
                                })
                                .catch(error => {
                                    console.log(error)
                                });

                                updateCartTotal();
                            }

                            decreaseBtn.addEventListener("click", () => {
                                updateQuantity(parseInt(quantityInput.value) - 1);
                            });

                            increaseBtn.addEventListener("click", () => {
                                updateQuantity(parseInt(quantityInput.value) + 1);
                            });

                            quantityInput.addEventListener("change", () => {
                                updateQuantity(parseInt(quantityInput.value));
                            });

                            removeButton.addEventListener("click", () => {
                                fetch(`/api/cart/delete/${id}`, {
                                    method: "DELETE",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                })
                                .then(response => {
                                    response.ok ? displayCartItems() : console.log("Failed to remove");
                                })
                                .catch(error => {
                                    console.log(error)
                                });
                            })
                        });

                        const totalElement = document.createElement("div");
                        totalElement.className = "cart-total mt-3";
                        cartItemsContainer.appendChild(totalElement);

                        updateCartTotal();

                        function updateCartTotal() {
                            subtotal = 0;
                            const itemPrices = cartItemsContainer.querySelectorAll(".item-price");
                            for (price of itemPrices) {
                                subtotal += parseFloat(price.textContent);
                            }

                            const tax = subtotal * 0.08;
                            const total = subtotal + tax;

                            totalElement.innerHTML = `
                                <hr>
                                <p>Subtotal: $${subtotal.toFixed(2)}</p>
                                <p>Tax (8%): $${tax.toFixed(2)}</p>
                                <h5>Total: $${total.toFixed(2)}</h5>
                            `;
                        }
                    })
                    .catch((error) => {
                        console.log(error)}
                    );
            }
        })
        .catch((error) => {
            console.log(error)}
        );
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
            a.setAttribute("data-id", category.id);

            a.addEventListener("click", () => {
                const links = document.querySelectorAll(".nav-link");
                for (let i = 0; i < links.length; i++) {
                    links[i].classList.remove("selected");
                }
                a.classList.add("selected");

                displayItemsFromCategory(category.id);
            });

            li.appendChild(a);
            categoryList.appendChild(li);
        }

        if (body.length > 0) {
            const firstCategoryLink = categoryList.querySelector(".nav-link");
            firstCategoryLink.classList.add("selected");
            firstCategoryLink.click();
            displayItemsFromCategory(1);
        }
    })
    .catch((error) => {
        console.log(error);
    });

filterSelect.addEventListener("change", () => {
    const selectedCategory = document.querySelector(".nav-link.selected");
    if (selectedCategory) {
        const categoryId = selectedCategory.getAttribute("data-id");
        displayItemsFromCategory(categoryId);
    }
});

document.querySelector(".nav-link[href='#cart']").addEventListener("click", () => {
    displayCartItems();
    const cartModal = new bootstrap.Modal(document.getElementById("cartModal"));
    cartModal.show();
});
