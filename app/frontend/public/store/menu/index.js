const categoryList = document.getElementById('categoryList');

fetch("/api/item/categories")
    .then((response) => {
        return response.json();
    })
    .then((body) => {
		console.log(body);
		for (let category of body) {
			const li = document.createElement('li');
            li.className = "nav-item";
            const a = document.createElement('a');
            a.className = "nav-link";
            a.href = '#';
            a.textContent = category.name;
            a.style.color = "black";

            a.addEventListener('click', function() {
                const links = document.querySelectorAll('.nav-link');
                for (let i = 0; i < links.length; i++) {
                    links[i].classList.remove('selected');
                }
                a.classList.add('selected');
            });

            li.appendChild(a);
            categoryList.appendChild(li)
		}
    })
    .catch((error) => {
        console.log(error);
    });