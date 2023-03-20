// --------------- FICHIER DE CONTRÔLE DE LA FONCTIONNALITÉ DE RECHERCHE ---------------

/** **************************** MODULES **************************************** */
/** ******************************************************************** */

import recipes from "../../../data/recipes.js"
import { createRecipesUpdateTags, recipesFiltered, recipesFilteredWithoutSearchConstraint, tagsSelectedElementArray } from "./filters.js"

/** **************************** PROCÉDURES **************************************** */
/** ******************************************************************** */

let recipesSearched = Object.assign([], recipes)

/* Cette liste sera utilisée dans le module associé au filtre par tag
et représente la liste résultante d'une recherche sans prendre en compte les tags
L'approche est de travailler sur la liste déjà traitée pour ne pas parcourir à chaque fois la liste complète de recettes.
Mais lorsque l'utilisateur retire un tag, nous ne pouvons pas juste récupérer la dernière liste obtenue
Comme les tags représentent une intersection et que nous n'avons pas sauvegardé les listes filtrées pour chaque tag, 
il n'est pas possible de connaître la nouvelle liste filtrée en partant de la précédente à laquelle on enlève le tag.
Si l'on a A intersection B intersection C, si l'on enlève B, pour connaître A inter C il faut connaître (sauvegarder) au préalable A et C. 
Nous sommes donc obligés de repartir d'une liste sans filtre et d'y appliquer chacun des filtres un par un
*/
let recipesSearchedWithoutTagsConstraint = Object.assign([], recipes) 

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
            recipesWithoutTagListToUse = recipesAndTagsToUse.recipesWithoutTag,
            tagsToShowKeyToUse = recipesAndTagsToUse.tags

        previousInputValue = searchText

        // Il n'est pas utile de lancer une recherche sur une liste déjà vide
        if(!recipesToSearchFrom.length) {
            recipesSearchedWithoutTagsConstraint = searchRecipes(searchText, recipesWithoutTagListToUse)
            return 
        } 

        else {

            recipesSearched = searchRecipes(searchText, recipesToSearchFrom)

            // Si la liste de départ est la liste complète, alors il n'y a aucun filtre d'appliqué, les listes issues de la recherche, avec ou sans filtre, sont donc les mêmes
            if(recipesToSearchFrom.length === recipes.length) recipesSearchedWithoutTagsConstraint = Object.assign([], recipesSearched)
            
            // On récupère les recettes matchant la recherche peu importe les tags sélectionnés
            else recipesSearchedWithoutTagsConstraint = searchRecipes(searchText, recipesWithoutTagListToUse)
        }

        createRecipesUpdateTags(recipesSearched, tagsToShowKeyToUse)

    } else {
        
        previousInputValue = ""

        // Puisque l'utilisateur n'effectue aucune recherche, la dernière liste obtenue est soit celle filtrée soit la liste complète 
        const recipesToSearchFrom = tagsSelectedElementArray.length ? recipesFilteredWithoutSearchConstraint : recipes
        recipesSearched = Object.assign([], recipesToSearchFrom)
        recipesSearchedWithoutTagsConstraint = Object.assign([], recipes)
        createRecipesUpdateTags(recipesSearched, 'initial')

    }
})


/* Détermine quelle est la liste de recettes sur laquelle appliquer la recherche principale
L'idée est ici que si les recettes ont déjà réduites suite à l'ajout d'un tag ou une recherche, 
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
        'recipesWithoutTag': [],
        'tags': []
    }


    if(previousInputValueLength && previousInputValueLength < searchText.length) {
    /* L'utilisateur a déjà saisi du texte ayant activé la recherche, et rajoute du texte. 
    On peut donc partir de la liste obtenue lors de la précédente recherche
    */

        // La précédente recherche n'ayant renvoyé aucun résultat, l'ajout de texte ne donnera pas plus de résultats
        if(!recipesSearched.length) {
            recipesAndTagsToUse.recipes = []
            
        } 

        else {
        // La liste la moins longue est celle sur laquelle le dernier traitement à été effectué. On repart de cette liste.
            recipesAndTagsToUse.recipes = recipesSearched.length < recipesFiltered.length ? recipesSearched : recipesFiltered
            recipesAndTagsToUse.tags = 'updated'
        } 

        recipesAndTagsToUse.recipesWithoutTag = recipesSearchedWithoutTagsConstraint

    } else {
    /* L'utilisateur n'avait pas encore saisi de texte activant la recherche ou est en train de supprimer du texte de sa saisie. 
    On ne peut pas repartir des résultats de la recherche précédente
    */
        // On récupère la liste filtrée par tag si au moins un tag a été choisi par l'utilisateur, sinon la liste complète de recettes
        recipesAndTagsToUse.recipes = tagsSelectedElementArray.length ? recipesFilteredWithoutSearchConstraint : recipes
        recipesAndTagsToUse.recipesWithoutTag = recipes
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