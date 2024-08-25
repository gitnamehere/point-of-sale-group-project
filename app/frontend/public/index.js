const web = document.getElementById("web");
const pos = document.getElementById("pos");

web.addEventListener("click", () => {
    location.href = "/store";
});

pos.addEventListener("click", () => {
    location.href = "./pos/index.html";
});
