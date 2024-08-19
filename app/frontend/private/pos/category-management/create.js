// rename the file to use across other files

const nameInput = document.getElementById("name");
const message = document.getElementById("message");

// handle item data sent to the backend
submit.addEventListener("click", () => {
    const category = {
        name: nameInput.value,
    };

    fetch("/api/category/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
    }).then((response) => {
        message.textContent = response.ok ? "Success" : "Failure";
    });
});
