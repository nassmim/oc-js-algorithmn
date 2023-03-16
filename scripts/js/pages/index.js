// --------------- FICHIER DE CONTRÔLE DE LA PAGE D'ACCUEIL ---------------

/** **************************** MODULES **************************************** */
/** ******************************************************************** */

import { createRecipeElements, createIngredientElement } from "../../templates/recipes.js";

import recipes from "../../../data/recipes.js"
import { filters } from "../utils/index.js";

const recipesElement = document.querySelector('.recipes')

recipes.forEach(recipe => {

    const recipeArticle = document.createElement('article')
    recipeArticle.classList.add('card')

    const recipeElementsHTML = createRecipeElements(recipe)

    recipeArticle.insertAdjacentHTML('beforeend', recipeElementsHTML)

    const listOfIngredientsElement = recipeArticle.querySelector('.card__ingredients')
    recipe.ingredients.forEach(ingredient => {
        const ingredientElement = createIngredientElement(ingredient)
        listOfIngredientsElement.insertAdjacentHTML('beforeend', ingredientElement)
    })

    recipesElement.appendChild(recipeArticle)
})

filters.setFilterDropdownsBehaviour()
