// rename the file to use across other files
const firstnameInput = document.getElementById("firstName");
const lastnameInput = document.getElementById("lastName");
const phoneNumberInput = document.getElementById("phone");
const emailInput = document.getElementById("email");

const submit = document.getElementById("submit");

submit.addEventListener("click", () => {
    console.log("clicked");
    const customer = {
        firstname: firstnameInput.value,
        lastname: lastnameInput.value,
        phone: phoneNumberInput.value,
        email: emailInput.value,
    };
    fetch("/api/auth/store/account/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
    }).then((response) => {
        response.ok ? alert("Success") : alert(response.statusText);

    });
});
