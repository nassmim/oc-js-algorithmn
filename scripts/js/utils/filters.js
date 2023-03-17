// --------------- FICHIER DE CONTRÔLE DES FONCTIONNALITES DE RECHERCHE ET FILTRE PAR TAG ---------------

/** **************************** MODULES **************************************** */
/** ******************************************************************** */

import { search } from "./index.js"
import recipes from "../../../data/recipes.js"
import { createRecipes } from "../../templates/recipes.js"


/** **************************** PROCEDURES **************************************** */
/** ******************************************************************** */

// Récupère les éléments permettant de filtrer les recettes par tag
const filterDropdowns = document.getElementsByClassName('filter-dropdown'), 
    filterDropdownsArray = Array.from(filterDropdowns)

// Récupère l'élément regroupant l'ensemble des tags choisis par l'utilisateur
const filterTagsElement = document.querySelector('.filters__tags')
const tagsSelectedElements = document.querySelectorAll('.tag')
let tagsSelectedElementArray = Array.from(tagsSelectedElements)
let tagsSelectedNames = []

let recipesFiltered = []

const inputsInitialValues = ['Ingrédients', 'Appareils', 'Ustensils']

// Récupère pour chaque dropdown tous les tags initiaux à montrer 
const ingredientsTags = getAllTags('ingredients')
const applianceTags = getAllTags('appliance')
const ustensilsTags = getAllTags('ustensils')

const tagsPerType = {
    "ingredients": ingredientsTags,
    "appliance": applianceTags,
    "ustensils": ustensilsTags,
}


/** **************************** FUNCTIONS **************************************** */
/** ******************************************************************** */


/* Récupère l'ensemble des tags présents dans l'ensemble des recettes 
et associés à un type de tags déterminé. 
    Paramètres :
        - Le type de tags 
    Renvoie :
        - Une liste de tags
*/
function getAllTags(tagType) {

    const tags = recipes.reduce((tagsList, recipe) => {
        const tags = getRightTypeTags(recipe, tagType)
        return tagsList.concat(tags)
    }, [])    

    const tagsWithoutDuplicates = [...new Set(tags)]

    return tagsWithoutDuplicates

}



/* Récupère les tags associés à une recette et à un type de tags
On considère que la structure de données reste identique 
    Paramètres :
        - Une recette
        - Un type de tags
    Renvoie :
        - Une liste de tags
*/
function getRightTypeTags(recipe, tagType) {

    let tags = []

    switch (tagType) {

        case 'ingredients':
            tags = recipe['ingredients'].map(item => item.ingredient)
            break

        case 'ustensils':
            tags = recipe['ustensils']
            break

            default:
            tags = recipe['appliance']
    }

    const listOfTags = Array.isArray(tags) ? tags : [tags],
        listOfTagsCapitalized = listOfTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase())

    return listOfTagsCapitalized

}


/* Définit le comportement des boutons de filtre par tag lorsque l'utilisateur clique dessus
    Paramètres :
        - Aucun
    Renvoie :
        - Rien
*/
function setFilterDropdownsBehaviour() {

    filterDropdownsArray.forEach((filterDropdown, index) => {

        const inputElement = filterDropdown.querySelector('.filter-dropdown__input'),
            inputName = inputElement.name

        // Crée la liste de tags associée au filtre
        createFilterDropdownTagsList(filterDropdown, tagsPerType[inputName])

        filterDropdown.addEventListener('click', (e) => {

            const clickedElement = e.target
            const isOpen = filterDropdown.className.includes('filter-dropdown--open') 

            if(isOpen) {
            // Le bouton est déjà ouvert, le clic a donc potentiellement pour but de le fermer

                const elementClassList = clickedElement.classList

                if(elementClassList.length) {

                    // Le clic est sur l'input, l'utilisateur désire faire une recherche
                    if(elementClassList.contains('filter-dropdown__input')) clickedElement.focus()

                    else if(elementClassList.contains('filter-dropdown__tag')) {
                    // L'utilisateur a sélectionné un tag

                        const tagName = clickedElement.textContent

                        if(!tagsSelectedNames.includes(tagName)) {
                        // Si le tag n'est pas déjà sélectionné, il est alors ajouté à la liste de tags 
                            
                            addTag(inputName, tagName)
                            if(tagsSelectedNames.length < 2 || recipesFiltered.length) filterRecipes(inputName, tagName)
                        } 
                    } 

                    // L'utilisateur désire fermer le filtre
                    else closeFilterDropdown(filterDropdown, inputElement, inputsInitialValues[index]) 

                } else closeFilterDropdown(filterDropdown, inputElement, inputsInitialValues[index]) 

            } else {
            // Le bouton n'est pas encore ouvert, l'utilisateur veut donc l'ouvrir

                openFilterDropdown(filterDropdown, inputElement)

                // Les autres dropdown de filtre doivent être fermés
                closeOtherFilterDropdowns(filterDropdown)

            }

        });

        // Définit ce qu'il doit se passer lorsque l'utilisateur tape du texte dans l'input du filtre
        const tagElements = filterDropdown.querySelectorAll('.filter-dropdown__tag')
        setFilterDropdownInputBehaviour(inputElement, tagElements)
        
    });
}


/* Crée l'élement HTML contenant une liste de tags associée à un filtre 
    Paramètres :
        - Un élément correspondant au filtre
        - Une liste de tags
    Renvoie :
        - Rien
*/
function createFilterDropdownTagsList(filterDropdown, listOfTags) {

    const tagsListElement = filterDropdown.querySelector('.filter-dropdown__tags-list')
    tagsListElement.innerHTML = ''
    // tagsListElement.parentNote.removeChild(tagsListElement)
    
    listOfTags.forEach(tag => {
        const tagElement = `<li class="filter-dropdown__tag">${tag}</li>`
        tagsListElement.insertAdjacentHTML('beforeend', tagElement)
    })
}


/* Définit les actions à réaliser à la fermeture du dropdown de filtre
    Paramètres :
        - Un élément HTML correspondant au filtre de tags
        - Une valeur d'input
    Renvoie :
        - Rien
*/
function closeFilterDropdown(filterDropdown, inputElement, inputInitialValue) {

    filterDropdown.classList.remove('filter-dropdown--open')

    // On rétablit les bons attribut/valeur à l'input
    setFilterDropdownInputAttribute(inputElement, 'button')
    inputElement.setAttribute('value', inputInitialValue)
}


/* Définit les actions à réaliser à l'ouverture du dropdown de filtre
    Paramètres :
        - Un élément HTML correspondant au filtre de tags
    Renvoie :
        - Rien
*/
function openFilterDropdown(filterDropdown, inputElement) {

    filterDropdown.classList.add('filter-dropdown--open')

    /* Lorsque le dropdown est fermé, on a un input de type bouton, 
    il faut le changer en text pour permettre à l'utilisateur de taper sa recherche
    */
    setFilterDropdownInputAttribute(inputElement, 'text') 
    inputElement.focus()   

}

/* Ferme les filtres non utilisés
    Paramètres :
        - Le filtre ouvert par l'utilisateur
    Renvoie :
        - Rien
*/
function closeOtherFilterDropdowns(filterDropdown) {

    filterDropdownsArray.forEach((element, index) => {

        if(element !== filterDropdown) {
        // Le filtre n'est pas celui sur lequel l'utilisateur a cliqué

            const isOpen = element.className.includes('filter-dropdown--open') 

            if(isOpen) {
            // Mais est ouvert, il faut donc le fermer

                const inputElement = element.querySelector('.filter-dropdown__input')
                closeFilterDropdown(element, inputElement, inputsInitialValues[index])

                /* On réitinialise la liste de tags associé à ce filtre que l'on ferme 
                pour qu'à la nouvelle ouverture de celui-ci, l'utilisateur voie la liste complète
                */
                const tagElements = element.querySelectorAll('.filter-dropdown__tag')
                showAllTags(tagElements)
            }
        } 

    })
}

/* Donne le bon attribue type à un input
    Paramètres :
        - Un élément input
        - une valeur pour l'attribut type
    Renvoie :
        - Rien
*/
function setFilterDropdownInputAttribute(inputElement, type) {
    inputElement.setAttribute('type', type)
}


/* Ajoute un tag à la liste de tags sélectionnés par l'utilisateur
    Paramètres :
        - Un élément venant d'être cliqué
        - Un texte correspondant au nom d'un tag
    Renvoie :
        - Rien
*/
function addTag(inputName, tagName) {

    const tagElement = createTag(inputName, tagName);

    setTagElementCloseBehaviour(tagElement, tagName)

    filterTagsElement.appendChild(tagElement);

    // Check si la liste de tags sélectionnés par le user est déjà visible ou non
    if(!filterTagsElement.className.includes('filters__tags--visible')) filterTagsElement.classList.add('filters__tags--visible')

    tagsSelectedNames.push(tagName)
    tagsSelectedElementArray.push(tagElement)
}


/* Crée un élément contenant le nom d'un tag
    Paramètres :
        - Un élément venant d'être cliqué
        - Un texte correspondant au nom d'un tag
    Renvoie :
        - L'élement tag
*/
function createTag(inputName, tagName) {

    // const dropdownElement = clickedElement.closest('.'+standardClassNameForFilterDropdown)
    // const elementBackgroundColor = window.getComputedStyle(dropdownElement, null).getPropertyValue("background-color")

    const tagElement = document.createElement('div');
    const elementInnerHTML = `

            <p class="tag__name">${tagName}</p>
            <svg class="tag__close" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_51_0)">
                <path d="M14.59 8L12 10.59L9.41 8L8 9.41L10.59 12L8 14.59L9.41 16L12 13.41L14.59 16L16 14.59L13.41 12L16 9.41L14.59 8ZM12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="white"/>
                </g>
                <defs>
                <clipPath id="clip0_51_0">
                <rect width="24" height="24" fill="white"/>
                </clipPath>
                </defs>
            </svg>
    `;

    tagElement.innerHTML = elementInnerHTML;

    tagElement.classList.add('tag', `tag--${inputName}`)
    // tagElement.style.backgroundColor = elementBackgroundColor

    return tagElement;
}


/* Définit le comportement d'un tag
    Paramètres :
        - Un élément correspondant à un tag
        - Un texte correspondant au nom du tag
    Renvoie :
        - Rien
*/
function setTagElementCloseBehaviour(tagElement, tagName) {

    const closeButton = tagElement.querySelector('.tag__close')
    closeButton.addEventListener('click', () => {
        filterTagsElement.removeChild(tagElement)
        tagsSelectedNames = tagsSelectedNames.filter(name => name !== tagName)
        tagsSelectedElementArray = tagsSelectedElementArray.filter(tag => tag.textContent.trim() !== tagName)
        console.log(tagsSelectedElementArray)
        filterRecipes()
    })

}


function filterRecipes(inputName=undefined, tagName=undefined) {

    if(tagName) {
        recipesFiltered = filterRecipesMore(inputName, tagName)
    console.log(recipesFiltered)
    } else {
        recipesFiltered =  filterRecipesLess()
    }

    // createRecipes(recipesFiltered)
}


function filterRecipesMore(inputName, tagName) {
    
    const recipesToSearchFrom = search.searchInput.value ? search.recipesSearched : tagsSelectedNames.length > 1 ? recipesFiltered : recipes
    
    let recipesFound = []
    switch(inputName) {

        case 'ingredients':
            recipesFound = filterRecipesByIngredient(recipesToSearchFrom, tagName)
            break
        
        case 'appliance':
            recipesFound = filterRecipesByAppliance(recipesToSearchFrom, tagName)
            break

        case 'ustensils':
            recipesFound = filterRecipesByUstensil(recipesToSearchFrom, tagName)
            break
    }

    return recipesFound
}



function filterRecipesByIngredient(recipesToSearchFrom, tagName) {

    const recipesFound = recipesToSearchFrom.reduce((listOfRecipes, recipe) => {
        const ingredients = recipe.ingredients.map(ingredient => ingredient.ingredient.toLowerCase())
        return ingredients.includes(tagName.toLowerCase()) ? listOfRecipes.concat(recipe) : listOfRecipes
    }, []) 

    return recipesFound
}



function filterRecipesByAppliance(recipesToSearchFrom, tagName) {

    const recipesFound = recipesToSearchFrom.reduce((listOfRecipes, recipe) => {
        return recipe.appliance.toLowerCase() === tagName.toLowerCase() ? listOfRecipes.concat(recipe) : listOfRecipes
    }, []) 

    return recipesFound
}



function filterRecipesByUstensil(recipesToSearchFrom, tagName) {

    const recipesFound = recipesToSearchFrom.reduce((listOfRecipes, recipe) => {
        const ustensils = recipe.ustensils.map(ustensil => ustensil.toLowerCase())
        return ustensils.includes(tagName.toLowerCase()) ? listOfRecipes.concat(recipe) : listOfRecipes
    }, []) 

    return recipesFound
}


function filterRecipesLess() {

    let recipesToSearchFrom = search.searchInput.value ? search.recipesSearched : recipes

    if(!tagsSelectedElementArray.length) recipesFiltered = Object.assign([], recipesToSearchFrom)
    else {

        tagsSelectedElementArray.forEach((tag, index) => {
            
            if(index > 0) recipesToSearchFrom = Object.assign([], recipesFiltered) 
            if(tag.classList.contains('tag--ingredients')) recipesFiltered = filterRecipesByIngredient(recipesToSearchFrom, tag.textContent.trim())
            else if (tag.classList.contains('tag--appliance')) recipesFiltered = filterRecipesByAppliance(recipesToSearchFrom, tag.textContent.trim())
            else recipesFiltered = filterRecipesByUstensil(recipesToSearchFrom, tag.textContent.trim())
        }) 
    }

    console.log(recipesFiltered)
}

/* Définit le comportement d'un input de filtre
    Paramètres :
        - Un élément HTML correspondant à un filtre
        - La valeur de l'attribut name de l'input associé au filtre
        - La valeur de l'attribut value de l'input associé au filtre
    Renvoie :
        - Rien
*/
function setFilterDropdownInputBehaviour(inputElement, tagElements) {

    inputElement.addEventListener('input', () => {

        const listOfTags = Array.from(tagElements)

        const inputValue = inputElement.value
 
        if(inputValue.length >= 3) {
        // L'utilisateur a tapé plus de trois lettres, on estime que c'est pertinent de lancer la recherche des tags 
    
            const regexToMatch = new RegExp('\^' + inputValue, 'i')
            // const matchedTags = tagsPerType[inputName].filter(tag => tag.includes(inputValue))
            // const matchedTagElements = filterTags(tagsToDisplay, regexToMatch, true)
            // const unmatchedTagElements = filterTags(tagsToDisplay, regexToMatch, false)
            
            // On crée de nouveau la liste de tags contenant seulement les tags retenus
            // createFilterDropdownTagsList(filterDropdown, matchedTags)
            showHideTags(listOfTags, regexToMatch)

        } else showAllTags(listOfTags) // La liste complète de tags doit être affichée

    })

}


/* Affiche ou cache les tags en fonction de la recherche effectuée par l'utilisateur
    Paramètres :
        - Une liste de tags initiale
        - Le texte de recherche de l'utilisateur
    Renvoie :
        - Rien
*/
function showHideTags(listOfTags, regexToMatch) {

    listOfTags.forEach(tagElement => {

        const tagName = tagElement.textContent

        if(tagName.match(regexToMatch)) tagElement.style.display = 'block'
        else tagElement.style.display = 'none'
        
    })

}


/* Affiche tous les tags 
    Paramètres :
        - Une liste de tags initiale
    Renvoie :
        - Rien
*/
function showAllTags(listOfTags) {
    listOfTags.forEach(tagElement => tagElement.style.display = 'block')
}


export { setFilterDropdownsBehaviour, setFilterDropdownInputBehaviour, recipesFiltered }
