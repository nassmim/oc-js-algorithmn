// --------------- FICHIER DE CONTRÔLE DE LA FONCTIONNALITÉ DE RECHERCHE ---------------

/** **************************** MODULES **************************************** */
/** ******************************************************************** */

import recipes from "../../../data/recipes.js"

import { createRecipesUpdateTags, recipesFiltered, tagsSelectedElementArray } from "./filters.js"

let recipesSearched = []

const searchInput = document.querySelector('.search-main__input'),
    searchInputIcon = document.querySelector('.search-main__icon')


searchInput.addEventListener('input', () => {

    const searchText = searchInput.value

    searchText.length ? searchInputIcon.style.opacity = 0 : searchInputIcon.style.opacity = 1

    if(searchText.length >= 3) {
        if(!recipesSearched.length) return // Pas besoin d'effectuer une recherche, car l'utilisateur a déjà saisi un texte introuvable
        recipesSearched = searchRecipes(searchText)
        createRecipesUpdateTags(recipesSearched, 'updated')
    } else {
        recipesSearched = []
        const recipesToSearchFrom = tagsSelectedElementArray.length ? recipesFiltered : recipes
        createRecipesUpdateTags(recipesToSearchFrom, 'initial')

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

    const regexToMatch = new RegExp('\(\\s\|\^\)' + searchText, 'i')

    let recipesFound = []
    for(let recipe of recipesToSearchFrom) {

        if(recipe.name.match(regexToMatch)) {
        // Si le titre de la recette contient le texte recherché, la recette peut être affichée et pas besoin de vérifier les autres informations 
            recipesFound.push(recipe)
            continue 

        } else if (recipe.description.match(regexToMatch)) {
        // Si la description de la recette contient le texte recherché, la recette peut être affichée et pas besoin de vérifier les autres informations 
            recipesFound.push(recipe)
            continue            

        } else {
        // Ni le titre ni la description ne matchent le texte recherché, on vérifie alors dans les ingrédients de la recette

            let recipeMatched = false,
                position = 0
                const ingredients = recipe.ingredients

            /* Boucle sur chaque ingrédient
            La boucle continue jusqu'à qu'on trouve un ingrédient matchant la recherche 
            ou que la liste d'ingrédients ait été parcourue au complet
            */
            do {
                const ingredient = ingredients[position].ingredient

                if(ingredient.match(regexToMatch)) {
                // L'ingrédient matche le texte recherché, on peut arrêter la boucle
                    recipesFound.push(recipe)
                    recipeMatched = true
                } else {
                // On passe à l'ingrédient suivant
                    position++
                }

            } while (recipeMatched === false && position < ingredients.length) 

        }

    }

    return recipesFound

}


export { searchRecipes, searchInput, recipesSearched }