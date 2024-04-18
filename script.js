const searchForm = document.querySelector('form');
const searchInput = document.querySelector('#search');
const resultsList = document.querySelector('#results');

document.getElementById('submit').addEventListener('click', searchRecipes);

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
})

async function searchRecipes() {
    try {
        const searchValue = searchInput.value.trim();
        const response = await fetch(`https://api.edamam.com/search?q=${searchValue}&app_id=0f6e5241&app_key=76b37e16c7a73008ec15ebebfc9a40d5&from=0&to=20`);
        const data = await response.json();
        displayRecipes(data.hits);
    } catch (error) {
        console.error('Failed to fetch recipes:', error);
    }
}


function displayRecipes(recipes) {
    let html = '';
    recipes.forEach((recipe) => {
        html += `
        <div>
            <h3>${recipe.recipe.label}</h3>
            <img src="${recipe.recipe.image}" alt="${recipe.recipe.label}">
            <ul>
                ${recipe.recipe.ingredientLines.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
            <a href="${recipe.recipe.url}" target="_blank">View Recipe</a>
        </div> 
        `
    })
    resultsList.innerHTML = html;
}