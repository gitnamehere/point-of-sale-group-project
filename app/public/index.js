const web = document.getElementById("web");
const pos = document.getElementById("pos");

web.addEventListener("click", () => {
    location.href = "./store/index.html";
});

pos.addEventListener("click", () => {
    location.href = "./pos/index.html";
});
