const newOrder = document.getElementById("order");

newOrder.addEventListener("click", () => {
    newOrder.style.backgroundColor = "blue";
    location.href = "/store/ordering";
});
