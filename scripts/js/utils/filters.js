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

// Récupère la liste d'éléments contenant un tag
const tagsSelectedElements = document.querySelectorAll('.tag')
let tagsSelectedElementArray = Array.from(tagsSelectedElements)

// La liste des tags sélectionnés par l'utilisateur
let tagsFromRecipes = []
    

// Permettra d'updater la liste de recettes à chaque fois qu'un filtre est ajouté/retiré
let recipesFiltered = []

const inputsInitialValues = ['Ingrédients', 'Appareils', 'Ustensils']

// Récupère pour chaque dropdown tous les tags initiaux à montrer 
const ingredientsTags = getAllTags('ingredients')
const applianceTags = getAllTags('appliance')
const ustensilsTags = getAllTags('ustensils')

const initialTags = {
    "ingredients": ingredientsTags,
    "appliance": applianceTags,
    "ustensils": ustensilsTags,
}

// Permettra d'updater la liste de tags que l'utilisateur peut choisir en fonction des recettes affichées
let tagsToShow = Object.assign({}, initialTags)

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
        // Récupère les tags associés au bon type ingrédients, etc.
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

    // On capitalise les tags et on s'assure que le reste est en minuscule; nécessaire d'uniformiser pour effectuer des comparaisons futures
    const listOfTags = Array.isArray(tags) ? tags : [tags],
        listOfTagsCapitalized = listOfTags.map(tag => capitalizeString(tag))

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
        createFilterDropdownTagsList(filterDropdown, initialTags[inputName])

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

                        const tagsSelectedNames = tagsSelectedElementArray.map(tag => tag.textContent.trim())
                        if(!tagsSelectedNames.includes(tagName)) {
                        // Le tag n'est pas encore sélectionné, on peut lancer les étapes de filtrage
                            
                            addTag(inputName, tagName)

                            /* Ce check permet de ne pas lancer de filtre s'il y a déjà au moins un tag de séléctionné
                                et que la liste de recette filtres est vide, car cela veut dire que la liste restera vide à l'ajout d'un nouveau tag
                            */
                            if(tagsSelectedNames.length < 2 || recipesFiltered.length) {

                                // Update la liste de recettes et crée l'élément contenant la nouvelle liste
                                recipesFiltered = filterRecipes(inputName, tagName)
                                createRecipes(recipesFiltered)

                                // Update la liste de tags à montrer dans ce filtre 
                                tagsToShow[inputName] = filterTags(tagsToShow[inputName])
                                createFilterDropdownTagsList(filterDropdown, tagsToShow[inputName])
                            } 
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
        - La valeur de l'attribut name de l'input
        - Un texte correspondant au nom d'un tag
    Renvoie :
        - Rien
*/
function addTag(inputName, tagName) {

    const tagElement = createTag(inputName, tagName);

    setTagElementCloseBehaviour(tagElement, tagName, inputName)

    filterTagsElement.appendChild(tagElement);

    // Check si la liste de tags sélectionnés par le user est déjà visible ou non
    if(!filterTagsElement.className.includes('filters__tags--visible')) filterTagsElement.classList.add('filters__tags--visible')

    // On ajoute le tag à la liste de tags choisis par l'utilisateur
    tagsSelectedElementArray.push(tagElement)
}


/* Crée un élément contenant le nom d'un tag
    Paramètres :
        - La valeur de l'attribut name de l'input
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
        - La valeur de l'attribut name de l'input
    Renvoie :
        - Rien
*/
function setTagElementCloseBehaviour(tagElement, tagName, inputName) {

    const closeButton = tagElement.querySelector('.tag__close')

    closeButton.addEventListener('click', () => {

        filterTagsElement.removeChild(tagElement)
        
        // Le tag doit être retité de la liste des tags choisis par l'utilisateur 
        tagsSelectedElementArray = tagsSelectedElementArray.filter(tag => tag.textContent.trim() !== tagName)
        
        // Puisque le tag est retiré, il faut updater la liste de recettes à afficher
        recipesFiltered = unfilterRecipes()

        // La liste de recettes ayant changé, il faut updater la liste de tags que l'on peut afficher à l'utilisateur
        tagsToShow[inputName] = filterTags(initialTags[inputName])
        const filterDropdown = document.querySelector(`.filter-dropdown--${inputName}`)
        createFilterDropdownTagsList(filterDropdown, tagsToShow[inputName])

    })

}


/* Filtre les recettes 
    Paramètres :
        - La valeur de l'attribute name de l'input
        - Un texte correspondant au nom du tag
    Renvoie :
        - Une liste de recettes
*/
function filterRecipes(inputName, tagName) {

    /* Détermine quelle liste de recettes utiliser 
        Si l'utilisateur utilise la recherche principale, les recettes a afficher sont celles qui matchent la recherche
        Si l'utilisateur n'a pas utilisé la recherche principale mais sélectionné un tag, les recettes à afficher
        sont celles contenant l'ensemble des tags
        Si ni la recherche principale ni tags n'ont été utiliser, alors on la liste totale de recettes sera utilisée
        Cela permet d'effectuer le filtre à partir de la dernière liste de recette connue, 
        et donc d'éviter de filtrer la liste initiale de recettes à chaque ajout de tags
    */
    const recipesToSearchFrom = search.searchInput.value > 3 ? search.recipesSearched : tagsSelectedElementArray.length > 1 ? recipesFiltered : recipes
    
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


/* Filtre les recettes par tag de type ingrédient 
    Paramètres :
        - Une liste de recette
        - Un nom de tag 
    Renvoie :
        - Une liste de recettes
*/
function filterRecipesByIngredient(recipesToSearchFrom, tagName) {

    let recipesFound = []
    recipesToSearchFrom.forEach(recipe => {

        const ingredients = recipe.ingredients.map(ingredient => capitalizeString(ingredient.ingredient))

        // On ajoute les ingrédients de la recette à la liste des tags contenus dans l'ensemble des recettes affichée
        tagsFromRecipes = tagsFromRecipes.concat(ingredients)

        // On retient la recette si elle contient l'ingrédient correspondant au tag choisi par l'utilisateur
        if(ingredients.includes(tagName)) recipesFound = recipesFound.concat(recipe) 

    }) 

    return recipesFound
}


/* Filtre les recettes par tag de type appareil 
    Paramètres :
        - Une liste de recette
        - Un nom de tag 
    Renvoie :
        - Une liste de recettes
*/
function filterRecipesByAppliance(recipesToSearchFrom, tagName) {

    let recipesFound = []
    recipesToSearchFrom.forEach(recipe => {

        const appliance = capitalizeString(recipe.appliance)

        // On ajoute l'appareil de la recette à la liste des tags contenus dans l'ensemble des recettes affichée
        tagsFromRecipes = tagsFromRecipes.push(appliance)
        
        if(appliance === tagName) recipesFound = recipesFound.concat(recipe) 

    }) 

    return recipesFound
}


/* Filtre les recettes par tag de type ustensil 
    Paramètres :
        - Une liste de recettes
        - Un nom de tag 
    Renvoie :
        - Une liste de recettes
*/
function filterRecipesByUstensil(recipesToSearchFrom, tagName) {

    let recipesFound = []
    recipesToSearchFrom.forEach(recipe => {

        const ustensils = recipe.ustensils.map(ustensil => capitalizeString(ustensil))

        // On ajoute les ustensils de la recette à la liste des tags contenus dans l'ensemble des recettes affichée
        tagsFromRecipes.concat(ustensils)

       if(ustensils.includes(tagName)) recipesFound = recipesFound.concat(recipe) 

    }) 

    return recipesFound
}


/* Dé-filtre les recettes. 
    Paramètres :
        - Aucun
    Renvoie :
        - Une liste de recettes
*/
function unfilterRecipes() {

    /* Détermine quelle liste de recettes utiliser en point de départ afin d'éviter de filtrer à chaque fois sur la liste entière
        Si l'utilisateur utilise la recherche principale, les recettes a afficher sont celles qui matchent la recherche
        Sinon la liste totale de recettes sera utilisée
        On n'utilise pas la liste filtrée par tags comme point de départ car aucune solution efficace trouvée
    */  
    let recipesToSearchFrom = search.searchInput.value > 3 ? search.recipesSearched : recipes

    let recipesFound = []

    if(!tagsSelectedElementArray.length) {
    // Le dernier tag vient d'être enlevé

        // Pas de filtre à réaliser, on conserve juste la liste définie plus haut
        recipesFound = Object.assign([], recipesToSearchFrom)

        // On récupère l'ensemble des tags contenus dans les recettes
        tagsFromRecipes = getTagsFromRecipes(recipesFound)
        
    } 

    else {
    // Il y a au moins un tag, il faut donc effectuer un filtre par tag 

        // On parcourt l'ensemble des tags sélectionnés par l'utilisateur
        tagsSelectedElementArray.forEach((tag, index) => {
            
            /* S'il s'agit du 2ème tag ou plus, la liste de départ doit être la liste filtré car 
                cela veut dire que la liste de recettes a déjà été filtrée par le premier tag
            */
            if(index > 0) recipesToSearchFrom = Object.assign([], recipesFiltered) 
            if(tag.classList.contains('tag--ingredients')) recipesFound = filterRecipesByIngredient(recipesToSearchFrom, tag.textContent.trim())
            else if (tag.classList.contains('tag--appliance')) recipesFound = filterRecipesByAppliance(recipesToSearchFrom, tag.textContent.trim())
            else recipesFound = filterRecipesByUstensil(recipesToSearchFrom, tag.textContent.trim())
        }) 
    }

    return recipesFound
}


/* Récupère une liste de tags contenus dans une liste de recettes
    Paramètres :
        - Une liste de recettes
    Renvoie :
        - Une liste de tags
*/
function getTagsFromRecipes(listOfRecipes) {

    // On parcourt l'ensemble des recette et on récupère pour chacune tous les ingrédients, l'appareil et tous les ustensils
    const tagsFound = listOfRecipes.reduce((listOfTags, recipe) => {

        const ingredients = recipe.ingredients.map(ingredient => capitalizeString(ingredient.ingredient)),
            appliance = capitalizeString(recipe.appliance),
            ustensils = recipe.ustensils.map(ustensil => capitalizeString(ustensil))

        return listOfTags.concat(ingredients).concat(appliance).concat(ustensils)

    })

    return tagsFound
}


/* Récupère la liste de tags à afficher compte tenu des recettes affichées
    Paramètres :
        - Une liste de tags
    Renvoie :
        - Une liste de tags
*/
function filterTags(listOfTags) {
    return listOfTags.filter(tag => tagsFromRecipes.includes(tag))
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
            // const matchedTags = tagsToShow[inputName].filter(tag => tag.includes(inputValue))
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


function capitalizeString(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}


export { setFilterDropdownsBehaviour, setFilterDropdownInputBehaviour, recipesFiltered }
