// --------------- FICHIER DE CONTRÔLE DE LA FONCTIONNALITÉ DE RECHERCHE ---------------

/** **************************** MODULES **************************************** */
/** ******************************************************************** */

import recipes from "../../../data/recipes.js"

import { filterTags, getTagsFromRecipes, recipesFiltered, tagsToShow, tagsSelectedElementArray } from "./filters.js"
import tagsFromRecipes from "./filters.js"

let recipesSearched = []

const searchInput = document.querySelector('.search-main__input')


searchInput.addEventListener('input', () => {

    const searchText = searchInput.value

    if(searchText.length > 3) {

        recipesSearched = searchRecipes(searchText)

        tagsFromRecipes = getTagsFromRecipes(recipesSearched)
        updateTagsToShow()

    } else {

        const recipesToSearchFrom = tagsSelectedElementArray.length ? recipesFiltered : recipes
        recipesSearched = Object.assign([], recipesToSearchFrom)

        tagsFromRecipes = getTagsFromRecipes(recipesSearched)
        updateTagsToShow()

    }
    
    
})






function searchRecipes(searchText) {

    /* Détermine sur quelle liste de recettes effectuer la recherche  
        Si l'utilisateur a déjà activé la recherche principale, alors la recherche doit s'effectuer sur les recettes trouvées
        Si la recherche principale n'a pas encore été déclenchée mais au moins a été choisi par l'utilisateur, 
        les recettes à afficher sont celles contenant l'ensemble des tags
        Si ni la recherche principale ni tags n'ont été utilisés, alors on la liste totale de recettes sera utilisée
        Cela permet d'effectuer la recherche à partir de la dernière liste de recettes obtenue, 
        et donc d'éviter de rechercher parmi la liste initiale de recettes à chaque input
    */     
    const recipesToSearchFrom = searchInput.value > 3 ? recipesSearched : tagsSelectedElementArray.length ? recipesFiltered : recipes

    const recipesFound = recipesToSearchFrom.reduce((listOfRecipes, recipe) => {

        const ingredients = recipe.ingredients.map(ingredient => ingredient.ingredient)

        const regexToMatch = new RegExp('\^' + searchText, 'i')

        let recipeMatchRegex = recipe.name.match(regexToMatch) || recipe.description.match(regexToMatch)
        ingredients.forEach(ingredient => recipeMatchRegex || ingredient.match(regexToMatch))

        return recipeMatchRegex ? listOfRecipes.concat(recipe) : listOfRecipes

    }, [])

    return recipesFound

}


function searchRecipesV2(searchText) {

    /* Détermine sur quelle liste de recettes effectuer la recherche  
        Si l'utilisateur a déjà activé la recherche principale, alors la recherche doit s'effectuer sur les recettes trouvées
        Si la recherche principale n'a pas encore été déclenchée mais au moins a été choisi par l'utilisateur, 
        les recettes à afficher sont celles contenant l'ensemble des tags
        Si ni la recherche principale ni tags n'ont été utilisés, alors on la liste totale de recettes sera utilisée
        Cela permet d'effectuer la recherche à partir de la dernière liste de recettes obtenue, 
        et donc d'éviter de rechercher parmi la liste initiale de recettes à chaque input
    */     
    const recipesToSearchFrom = searchInput.value > 3 ? recipesSearched : recipesFiltered.length < recipes.length ? recipesFiltered : recipes

    const recipesFound = recipesToSearchFrom.reduce((listOfRecipes, recipe) => {

        const ingredients = recipe.ingredients.map(ingredient => ingredient.ingredient),
            ingredientsString = ingredients.join(' ')

        const regexToMatch = new RegExp(searchText, 'i')
        const textsToSearchIn = `${recipe.name} ${ingredientsString} ${recipe.description}`
        const recipeMatchRegex = textsToSearchIn.match(regexToMatch)

        return recipeMatchRegex ? listOfRecipes.concat(recipe) : listOfRecipes

    }, [])

    return recipesFound

}


function updateTagsToShow() {

    Object.keys(tagsToShow).forEach(key => {
        tagsToShow[key] = filterTags(tagsToShow[key])
    })

}


export { searchRecipes, searchInput, recipesSearched }