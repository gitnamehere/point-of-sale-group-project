const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const button = document.getElementById("submit");

button.addEventListener("click", () => {
    console.log("clicked!");
    const username = usernameInput.value;
    const password = passwordInput.value;

    console.log(username);
    console.log(password);

    fetch("/api/auth/pos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    })
        .then((response) => {
            // redirect to homepage if everything checks out
            response.status === 200
                ? (window.location = "/pos")
                : alert("Invalid Username or Password");
        })
        .catch((error) => console.log(error));
});
