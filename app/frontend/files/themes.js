const backgroundElement = document.getElementById("background");
const headerElement = document.getElementById("header");

fetch("/api/themes")
    .then((response) => {
        if (response.status !== 200) return alert("Error fetching themes");

        return response.json().then((body) => {
            const { background_color, header_primary_color } = body[0];

            if (backgroundElement !== null)
                backgroundElement.style.backgroundColor = background_color;
            if (headerElement !== null)
                headerElement.style.backgroundColor = header_primary_color;
        });
    })
    .catch((error) => {
        console.log(error);
        alert("Error fetching themes");
    });
