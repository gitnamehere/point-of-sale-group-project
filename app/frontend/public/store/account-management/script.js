// rename the file to use across other files

const firstnameInput = document.getElementById("firstName");
const lastnameInput = document.getElementById("lastName");
const phoneNumberInput = document.getElementById("phone");
const emailInput = document.getElementById("email");

const submit = document.getElementById("submit");

// handle item data sent to the backend
submit.addEventListener("click", () => {
    const customer = {
        firstname: firstnameInput.value,
        lastname: lastnameInput.value,
        phone: phoneNumberInput.value,
        email: emailInput.value,
    };
    api/auth/store/account/create
    fetch("/api/accounts/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
    }).then((response) => {
        message.textContent = response.ok ? "Success" : "Failure";
    });
});
