// --------------- FICHIER QUI GERE L'UI DES CARTES DE RECETTES ---------------

const recipesElement = document.querySelector('.recipes')

function createRecipes(recipes) {

    // Pas d'event handler sur les cartes de recettes, on peut vider la liste de recettes comme ça
    recipesElement.innerHTML = ""

    recipes.forEach(recipe => {

        const recipeArticle = document.createElement('article')
        recipeArticle.classList.add('card')
    
        const recipeElementsHTML = createRecipeElements(recipe)
    
        recipeArticle.insertAdjacentHTML('beforeend', recipeElementsHTML)
        
        createListOfIngredientsElement(recipe, recipeArticle)

        recipesElement.appendChild(recipeArticle)
    })
}


function createRecipeElements(recipe) {

    const article = `

        <header class="card__header">
            <a href="#" class="card__link card__link--image">
                <img src="assets/images/blanck_recipe.png" alt="Thumbnail vide de la recette ${recipe.name}"
                    class="card__image">
            </a>
        </header>

        <div class="card__body">

            <div class="card__information">

                <h2 class="card__title">${recipe.name}</h2>

                <div class="card__duration-information">

                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_4_71)">
                            <path
                                d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z"
                                fill="black" />
                        </g>
                        <defs>
                            <clipPath id="clip0_4_71">
                                <rect width="24" height="24" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>

                    <span class="card__duration">${recipe.time} min</span>
                </div>

            </div>

            <ul class="card__ingredients container--card__ingredients"></ul>

            <p class="card__cooking-steps">${recipe.description}</p>

        </div>
    `

    return article
}


function createListOfIngredientsElement(recipe, recipeArticle) {

    const listOfIngredientsElement = recipeArticle.querySelector('.card__ingredients')
    recipe.ingredients.forEach(ingredient => {
        const ingredientElement = createIngredientElement(ingredient)
        listOfIngredientsElement.insertAdjacentHTML('beforeend', ingredientElement)
    })

}


function createIngredientElement(ingredient) {

    let ingredientElement;
    if(ingredient.quantity) {

        ingredientElement = `
            <li class="card__ingredient-item">
                <span class="card__ingredient-name">${ingredient.ingredient} : </span> 
                ${ingredient.quantity} ${ingredient.unit ? ingredient.unit : ""}
            </li>
        ` 

    } else {

        ingredientElement = `
            <li class="card__ingredient-item">
                <span class="card__ingredient-name">${ingredient.ingredient}</span> 
            </li>
        `
                  
    }


    return ingredientElement
}

export { createRecipes }