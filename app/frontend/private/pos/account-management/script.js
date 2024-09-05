// rename the file to use across other files

const usernameInput = document.getElementById("userName");
const firstnameInput = document.getElementById("firstName");
const lastnameInput = document.getElementById("lastName");
const passwordInput = document.getElementById("password");

const create = document.getElementById("submit");

// handle item data sent to the backend
create.addEventListener("click", () => {
    const account = {
        username: usernameInput.value,
        firstname: firstnameInput.value,
        lastname: lastnameInput.value,
        password: passwordInput.value,
        accountType: "admin",
    };

    fetch("/api/auth/accounts/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
    }).then((response) => {
        response.ok ? alert("Success") : alert(response.statusText);
    });
});
