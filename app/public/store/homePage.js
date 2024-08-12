

let categories = [];

fetch("/api/item/categories", {
    method: "GET",
    headers: {
        'Content-Type': 'application/json'
    }
    })
    .then((response) => {
        return response.json();
    })
    .then((body) => {
        console.log(body);
        const categoryBar = document.getElementById("categories");
        body.forEach((cat) => {
            console.log(cat);
            const a = document.createElement("a");
            a.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            a.textContent = cat.name
            categoryBar.append(a)
        })
    })
    .catch((error) => {
        console.log(error);
    });




