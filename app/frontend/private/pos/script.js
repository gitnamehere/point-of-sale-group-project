const logout = document.getElementById("logout");
const currentUser = document.getElementById("user");

fetch("/api/auth/pos/currentUser")
    .then(async (response) => {
        const user = await response.json();
        currentUser.textContent = user.first_name + " " + user.last_name;

    })
    .catch((error) => console.log(error));

logout.addEventListener("click", () => {
    fetch("/api/auth/pos/logout")
        .then((response) => {
            response.status === 200
                ? (window.location = "/pos/login")
                : alert("Error logging out");
        })
        .catch((error) => console.log(error));
});
