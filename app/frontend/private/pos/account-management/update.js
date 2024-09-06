// rename the file to use across other files
const accounts = document.getElementById("accounts");
const usernameInput = document.getElementById("userName");
const firstnameInput = document.getElementById("firstName");
const lastnameInput = document.getElementById("lastName");
const passwordInput = document.getElementById("password");

const update = document.getElementById("submit");
let accountId = null;
let accountList = [];

fetch("/api/auth/accounts")
    .then((response) => {
        return response.json();
    })
    .then((body) => {
        firstnameInput.value = body[0].first_name;
        lastnameInput.value = body[0].last_name;
        usernameInput.value = body[0].username;
        accountId = body[0].id;

        for (let i = 0; i < body.length; i++) {
            const account = body[i];
            const option = document.createElement("option");
            option.value = account.id;
            option.textContent = account.first_name + " " + account.last_name;
            accounts.append(option);
            accountList.push(account);
        }
    })
    .catch((error) => {
        console.log(error);
    });

accounts.addEventListener("change", () => {
    let account = accounts.value;
    accountId = account;

    firstnameInput.value = accountList[accountId - 1].first_name;
    lastnameInput.value = accountList[accountId - 1].last_name;
    usernameInput.value = accountList[accountId - 1].username;
});

// handle item data sent to the backend
update.addEventListener("click", () => {
    const account = {
        username: usernameInput.value,
        firstname: firstnameInput.value,
        lastname: lastnameInput.value,
        password: passwordInput.value,
        accountType: "admin",
    };

    fetch(`/api/auth/pos/account/modify/${accountId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
    }).then((response) => {
        response.ok ? alert("Success") : alert(response.statusText);
    });
});
