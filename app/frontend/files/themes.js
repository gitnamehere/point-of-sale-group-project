const backgroundElement = document.getElementById("background");
const primaryBackground = document.getElementsByClassName("primary-background");
const primaryText = document.getElementsByClassName("primary-text");
const secondaryBackground = document.getElementsByClassName("secondary-background");
const secondaryText = document.getElementsByClassName("secondary-text");

fetch("/api/themes")
    .then((response) => {
        if (response.status !== 200) return alert("Error fetching themes");

        return response.json().then((body) => {
            const { background_color, primary_color, secondary_color } = body[0];

            if (backgroundElement !== null)
                backgroundElement.style.backgroundColor = background_color;
            
            for (let i = 0; i < primaryBackground.length; i++) {
                primaryBackground[i].style.backgroundColor = primary_color;
            }
            for (let i = 0; i < primaryText.length; i++) {
                primaryText[i].style.color = primary_color;
            }
            for (let i = 0; i < secondaryBackground.length; i++) {
                secondaryBackground[i].style.backgroundColor = secondary_color;
            }
            for (let i = 0; i < secondaryText.length; i++) {
                secondaryText[i].style.color = secondary_color;
            }
        });
    })
    .catch((error) => {
        console.log(error);
        alert("Error fetching themes");
    });
