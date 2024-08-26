const logout = document.getElementById("logout");

logout.addEventListener("click", () => {
    fetch("/api/auth/pos/logout")
        .then((response) => {
            response.status === 200
                ? (window.location = "/pos/login")
                : alert("Error logging out");
        })
        .catch((error) => console.log(error));
});
