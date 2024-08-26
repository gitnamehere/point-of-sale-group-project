// script that populates certain HTML text with business information
// this assumes that there is only one element for each business info
// change to getElementsByClassName instead of getElementById
// if there are a multiple of each element in a page
// (make sure to update every page that uses this)
const businessNameElement =
    document.getElementById("business-name");
const descriptionElement = document.getElementById("description");
const addressOneElement = document.getElementById("address-one");
const addressTwoElement = document.getElementById("address-two");
const phoneElement = document.getElementById("phone");
const emailElement = document.getElementById("email");

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

            if (businessNameElement !== null)
                businessNameElement.textContent = business_name;
            if (descriptionElement !== null)
                descriptionElement.textContent = description;
            if (addressOneElement !== null)
                addressOneElement.textContent = address_one;
            if (addressTwoElement !== null)
                addressTwoElement.textContent = address_two;
            if (phoneElement !== null) phoneElement.textContent = phone_number;
            if (emailElement !== null) emailElement.textContent = email;
        });
    })
    .catch((error) => {
        console.log(error);
        alert("Error fetching business info");
    });
