const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const phoneInput = document.getElementById("phone");
const addressOneInput = document.getElementById("address-one");
const addressTwoInput = document.getElementById("address-two");
const submit = document.getElementById("submit");

fetch("/api/business-information")
    .then((response) => {
        if (response.status !== 200)
            return alert("Error fetching business information");

        return response.json().then((body) => {
            const { business_name, description, address_one, address_two, phone_number } =
                body[0];

            nameInput.value = business_name;
            descriptionInput.value = description;
            addressOneInput.value = address_one;
            addressTwoInput.value = address_two;
            phoneInput.value = phone_number;
        });
    })
    .catch((error) => {
        console.log(error);
        alert("An error occured");
    });

submit.addEventListener("click", () => {
    fetch("/api/business-information", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: nameInput.value,
            description: descriptionInput.value,
            address_one: addressOneInput.value,
            address_two: addressTwoInput.value,
            phone: phoneInput.value,
        }),
    })
        .then((response) => {
            response.status !== 200
                ? alert("Error fetching business information")
                : alert("Successfully changed business settings!");
        })
        .catch((error) => {
            console.log(error);
            alert("An error occured");
        });
});
