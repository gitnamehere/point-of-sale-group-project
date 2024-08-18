// rename the file to use across other files

const usernameInput = document.getElementById("username");
const firstnameInput = document.getElementById("firstname");
const lastnameInput = document.getElementById("lastname");

const submit = document.getElementById("submit");

// handle item data sent to the backend
submit.addEventListener("click", () => {
    const account = {
        username: usernameInput.value,
        firstname: firstnameInput.value,
        lastname: lastnameInput.value,
        accountType: "staff",
    };

    fetch("/api/accounts/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
    }).then((response) => {
        message.textContent = response.ok ? "Success" : "Failure";
    });
});
