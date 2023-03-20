// --------------- FICHIER DE CONTRÔLE DE LA FONCTIONNALITÉ DE RECHERCHE ---------------

/** **************************** MODULES **************************************** */
/** ******************************************************************** */

import recipes from "../../../data/recipes.js"
import { createRecipesUpdateTags, recipesFilteredWithoutSearchConstraint, tagsSelectedElementArray } from "./filters.js"

/** **************************** PROCÉDURES **************************************** */
/** ******************************************************************** */

let recipesSearched = []

/* Cette liste représente la liste filtrée par rapport à la recherche principale sans prendre en compte les tags sélectionnés.  
Elle a pour but de pouvoir filtrer la liste lorsqu'un tag est retiré, tout en prenant en considération la recherche principale
*/
let recipesSearchedWithoutTagsConstraint = [] 

const searchInput = document.querySelector('.search-main__input'),
    searchInputIcon = document.querySelector('.search-main__icon')

/* Sert de sauvegarde de la dernière saisie de l'utilisateur, et permet de checker
à la prochaine saisie si l'utilisateur rajoute ou enlève du texte */
let previousInputValue = ""

searchInput.addEventListener('input', () => {

    const searchText = searchInput.value,
        searchTextLength = searchText.length

    searchTextLength ? searchInputIcon.style.opacity = 0 : searchInputIcon.style.opacity = 1

    if(searchTextLength >= 3) {

        // Récupère la liste de recettes à partir de laquelle effectuer la recherche
        const recipesAndTagsToUse = getRecipesAndTagsToUse(searchText),
            recipesToSearchFrom = recipesAndTagsToUse.recipes,
            tagsToShowKeyToUse = recipesAndTagsToUse.tags

        previousInputValue = searchText

        // Il n'est pas utile de lancer une recherche sur une liste vide
        if(!recipesToSearchFrom.length) return 
        else {
            recipesSearched = searchRecipes(searchText, recipesToSearchFrom)

            if(recipesToSearchFrom.length === recipes.length) {
            // Si la liste de départ est déjà la liste complète, pas besoin de relancer une recherche pour updater la liste obtenue sans considération des tags
                recipesSearchedWithoutTagsConstraint = Object.assign([], recipesSearched)
            } else recipesSearchedWithoutTagsConstraint = searchRecipes(searchText, recipes)
        }

        createRecipesUpdateTags(recipesSearched, tagsToShowKeyToUse)

    } else {
        recipesSearched = []
        const recipesToSearchFrom = tagsSelectedElementArray.length ? recipesFilteredWithoutSearchConstraint : recipes
        createRecipesUpdateTags(recipesToSearchFrom, 'initial')

    }
    
})


/* Détermine quelle est la liste de recettes sur laquelle appliquer la recherche principale
L'idée est ici que si les recettes ont déjà subi un filtre suite à l'ajout d'un tag ou une recherche, 
alors on peut repartir de cette liste pour que la recherche soit plus rapide
    Paramètres :
        - La saisie dans le champ de recherche
    Renvoie :
        - Une liste de recettes
*/
function getRecipesAndTagsToUse(searchText) {

    const previousInputValueLength = previousInputValue.length

    let recipesAndTagsToUse = {
        'recipes': [],
        'tags': []
    }


    if(previousInputValueLength && previousInputValueLength < searchText.length) {
    /* L'utilisateur a déjà saisi du texte ayant activé la recherche, et rajoute du texte. 
    On peut donc partir de la liste obtenue lors de la précédente recherche
    */

        if(!recipesSearched.length) recipesAndTagsToUse.recipes = []
        else {
            recipesAndTagsToUse.recipes = recipesSearched
            recipesAndTagsToUse.tags = 'updated'
        } 

    } else {
    /* L'utilisateur n'avait pas encore saisi de texte activant la recherche ou est en train de supprimer du texte de sa saisie. 
    On ne peut pas repartir des résultats de la recherche précédente
    */
        // On récupère la liste filtrée par tag si au moins un tag a été choisi par l'utilisateur, sinon la liste complète de recettes
        recipesAndTagsToUse.recipes = tagsSelectedElementArray.length ? recipesFilteredWithoutSearchConstraint : recipes
        recipesAndTagsToUse.tags = 'updated'

        if(previousInputValueLength) {
            recipesAndTagsToUse.tags = 'initial'
        }
    } 

    return recipesAndTagsToUse

}


/* Filtre les recettes qui matchent le texte saisi dans la recherche principale
    Paramètres :
        - La saisie dans le champ de recherche
        - Une liste de recettes sur laquelle effectuer la recette
    Renvoie :
        - Une liste de recettes
*/
function searchRecipes(searchText, recipesToSearchFrom) {

   const regexToMatch = new RegExp('\(\\s\|\^\)' + searchText, 'i')
   
   let recipesFound = []
    for(let recipe of recipesToSearchFrom) {

        if(recipe.name.match(regexToMatch) || recipe.description.match(regexToMatch)) {
        // Si le titre ou la description de la recette contient le texte recherché, la recette peut être affichée et pas besoin de vérifier les autres informations 
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


export { searchRecipes, searchInput, recipesSearched, recipesSearchedWithoutTagsConstraint }