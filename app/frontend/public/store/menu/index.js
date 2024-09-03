const categoryList = document.getElementById("categoryList");
const itemTable = document.getElementById("items");
const filterSelect = document.getElementById("filterSelect");

let currentToast = null;
let subtotal = 0;

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

                const addToCartButton =
                    cardBody.querySelector(".btn.btn-primary");
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

document
    .querySelector(".nav-link[href='#cart']")
    .addEventListener("click", () => {
        displayCartItems();
        const cartModal = new bootstrap.Modal(
            document.getElementById("cartModal"),
        );
        cartModal.show();
    });

filterSelect.addEventListener("change", () => {
    const selectedCategory = document.querySelector(".nav-link.selected");
    if (selectedCategory) {
        const categoryId = selectedCategory.getAttribute("data-id");
        displayItemsFromCategory(categoryId);
    }
});

function addItemToast() {
    const toastEl = document.getElementById("cartToast");

    if (currentToast) {
        currentToast.dispose();
    }

    const newToastEl = toastEl.cloneNode(true);
    toastEl.parentNode.replaceChild(newToastEl, toastEl);

    currentToast = new bootstrap.Toast(newToastEl, {
        autohide: true,
        delay: 1500,
    });

    currentToast.show();
}

function saveCartToLocalStorage(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function getCartFromLocalStorage() {
    const cartData = localStorage.getItem("cart");
    return cartData ? JSON.parse(cartData) : [];
}

function updateCart(id) {
    let cart = getCartFromLocalStorage();
    
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, quantity: 1 });
    }
    
    saveCartToLocalStorage(cart);
    addItemToast();
    displayCartItems();
}

function displayCartItems() {
    let cart = getCartFromLocalStorage();
    const cartItemsContainer = document.getElementById("cartItems");
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        const itemPromises = cart.map(item =>
            fetch(`/api/items/${item.id}`)
                .then((response) => {
                    return response.json()
                })
                .then((body) => {
                    return ({ ...body[0], quantity: item.quantity });
                })
                .catch((error) => {
                    console.log(error);
                })
        );

        Promise.all(itemPromises)
            .then(itemsDetails => {
                subtotal = 0;

                itemsDetails.forEach(itemDetail => {
                    const quantity = itemDetail.quantity;
                    const itemTotalPrice = itemDetail.price * quantity;

                    subtotal += itemTotalPrice;

                    const itemElement = document.createElement("div");
                    itemElement.className = "cart-item mb-3";
                    itemElement.innerHTML = `
                        <h6>${itemDetail.name}</h6>
                        <div class="quantity-control">
                            <button class="btn btn-sm btn-secondary decrease-btn">-</button>
                            <input type="number" class="form-control form-control-sm quantity-input" value="${quantity}" min="1" style="width: 60px; display: inline-block;">
                            <button class="btn btn-sm btn-secondary increase-btn">+</button>
                        </div>
                        <p>Price: $<span class="item-price">${itemTotalPrice.toFixed(2)}</span></p>
                        <button class="btn btn-danger btn-sm remove-btn">Remove</button>`
                    ;
                    cartItemsContainer.appendChild(itemElement);

                    const quantityInput = itemElement.querySelector(".quantity-input");
                    const decreaseBtn = itemElement.querySelector(".decrease-btn");
                    const increaseBtn = itemElement.querySelector(".increase-btn");
                    const itemPrice = itemElement.querySelector(".item-price");
                    const removeButton = itemElement.querySelector(".remove-btn");

                    function updateQuantity(newQuantity) {
                        if (newQuantity < 1) {
                            newQuantity = 1;
                        }

                        const index = cart.findIndex(item => item.id === itemDetail.id);
                        cart[index].quantity = newQuantity;
                        saveCartToLocalStorage(cart);
                        quantityInput.value = newQuantity;
                        itemPrice.textContent = (itemDetail.price * newQuantity).toFixed(2);
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
                        cart = cart.filter(item => item.id !== itemDetail.id);
                        saveCartToLocalStorage(cart);
                        displayCartItems();
                    });
                });

                const totalElement = document.createElement("div");
                totalElement.className = "cart-total mt-3";
                cartItemsContainer.appendChild(totalElement);

                updateCartTotal();

                function updateCartTotal() {
                    subtotal = 0;
                    const itemPrices = cartItemsContainer.querySelectorAll(".item-price");
                    for (let price of itemPrices) {
                        subtotal += parseFloat(price.textContent);
                    }

                    const tax = subtotal * 0.08;
                    const total = subtotal + tax;

                    totalElement.innerHTML = `
                        <p>Subtotal: $${subtotal.toFixed(2)}</p>
                        <p>Tax (8%): $${tax.toFixed(2)}</p>
                        <h5>Total: $${total.toFixed(2)}</h5>`
                    ;
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
}

function cartArrayToObject(cartArray) {
    return cartArray.reduce((obj, item) => {
        obj[item.id] = item.quantity;
        return obj;
    }, {});
}

function sendOrder(cartItems) {
    const cartObject = cartArrayToObject(cartItems);

    fetch("/api/orders/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ order: cartObject, subtotal }),
    })
        .then((response) => {
            if (response.ok) {
                alert("Thank you for your order!");
                localStorage.removeItem("cart");
                displayCartItems();
            } else {
                alert("Order failed");
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const confirmOrderBtn = document.getElementById("confirmOrderBtn");
    const confirmOrderModal = new bootstrap.Modal(
        document.getElementById("confirmOrderModal")
    );

    placeOrderBtn.addEventListener("click", () => {
        confirmOrderModal.show();
    });

    confirmOrderBtn.addEventListener("click", () => {
        const cart = getCartFromLocalStorage();
        
        if (cart.length === 0) {
            alert("No items!");
        } else {
            sendOrder(cart);
        }

        confirmOrderModal.hide();
        bootstrap.Modal.getInstance(
            document.getElementById("cartModal")
        ).hide();
    });

    displayCartItems();
});
