const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const phoneInput = document.getElementById("phone");
const addressOneInput = document.getElementById("address-one");
const addressTwoInput = document.getElementById("address-two");
const emailInput = document.getElementById("email");
const submit = document.getElementById("submit");

const backgroundColorInput = document.getElementById("background-color");
const headerPrimaryColorInput = document.getElementById("header-primary");
const headerSecondaryColorInput = document.getElementById("header-secondary");
const submitTheme = document.getElementById("submit-theme");

fetch("/api/business-information")
    .then((response) => {
        if (response.status !== 200)
            return alert("Error fetching business information");

        return response.json().then((body) => {
            const {
                business_name,
                description,
                address_one,
                address_two,
                phone_number,
                email,
            } = body[0];

            nameInput.value = business_name;
            descriptionInput.value = description;
            addressOneInput.value = address_one;
            addressTwoInput.value = address_two;
            phoneInput.value = phone_number;
            emailInput.value = email;
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
            email: emailInput.value,
        }),
    })
        .then((response) => {
            response.status !== 200
                ? alert("Error changing business information")
                : alert("Successfully changed business settings!");
        })
        .catch((error) => {
            console.log(error);
            alert("An error occured");
        });
});

fetch("/api/themes")
    .then((response) => {
        if (response.status !== 200)
            return alert("Error fetching themes");

        return response.json().then((body) => {
            const { background_color, header_primary_color, header_secondary_color } = body[0];

            backgroundColorInput.value = background_color;
            headerPrimaryColorInput.value = header_primary_color;
            headerSecondaryColorInput.value = header_secondary_color;
        });
    })
    .catch((error) => {
        console.log(error);
        alert("An error occured");
    });

submitTheme.addEventListener("click", () => {
    fetch("/api/themes", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            background_color: backgroundColorInput.value,
            header_primary_color: headerPrimaryColorInput.value,
            header_secondary_color: headerSecondaryColorInput.value,
        }),
    })
        .then((response) => {
            response.status !== 200
                ? alert("Error setting theme")
                : alert("Successfully changed theme!");
        })
        .catch((error) => {
            console.log(error);
            alert("An error occured");
        });
});