// --------------- FICHIER DE CONTRÔLE DES FONCTIONNALITES DE RECHERCHE ET FILTRE PAR TAG ---------------

/** **************************** MODULES **************************************** */
/** ******************************************************************** */

import recipes from "../../../data/recipes.js"


/** **************************** PROCEDURES **************************************** */
/** ******************************************************************** */

// Récupère les éléments permettant de filtrer les recettes par tag
const filterDropdowns = document.getElementsByClassName('filter-dropdown'), 
    filterDropdownsArray = Array.from(filterDropdowns)

const standardClassNameForFilterDropdown = 'filter-dropdown'

// Récupère l'élément regroupant l'ensemble des tags choisis par l'utilisateur
const filterTagsElement = document.querySelector('.filters__tags')
let tagsSelectedNames = []

const inputsInitialValues = ['Ingrédients', 'Appareils', 'Ustensils']

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

    const listOfTags = Array.isArray(tags) ? tags : [tags]

    return listOfTags

}


/* Définit le comportement des boutons de filtre par tag lorsque l'utilisateur clique dessus
    Paramètres :
        - Aucun
    Renvoie :
        - Rien
*/
function setFilterDropdownsBehaviour() {

    filterDropdownsArray.forEach((filterDropdown, index) => {

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
                        // Si le tag n'est pas déjà sélectionné, il est alors ajouté à la liste de tags 
                        if(!tagsSelectedNames.includes(tagName)) addTag(clickedElement, tagName)
                    } 

                    // L'utilisateur désire fermer le filtre
                    else closeFilterDropdown(filterDropdown, inputsInitialValues[index]) 

                } else closeFilterDropdown(filterDropdown, inputsInitialValues[index]) 

            } else {
            // Le bouton n'est pas encore ouvert, l'utilisateur veut donc l'ouvrir

                openFilterDropdown(filterDropdown)

                // Les autres dropdown de filtre doivent être fermés
                closeOtherFilterDropdowns(filterDropdown)

            }

        });
        
    });
}


/* Définit les actions à réaliser à la fermeture du dropdown de filtre
    Paramètres :
        - Un élément HTML correspondant au filtre de tags
        - Une valeur d'input
    Renvoie :
        - Rien
*/
function closeFilterDropdown(filterDropdown, inputInitialValue) {

    filterDropdown.classList.remove('filter-dropdown--open')

    // Récupération de l'input associé à ce filtre pour lui rétablir les bons attribut/valeur
    const inputElement = filterDropdown.querySelector('.filter-dropdown__input')
    setFilterDropdownInputAttribute(inputElement, 'button')
    inputElement.setAttribute('value', inputInitialValue)
}


/* Définit les actions à réaliser à l'ouverture du dropdown de filtre
    Paramètres :
        - Un élément HTML correspondant au filtre de tags
    Renvoie :
        - Rien
*/
function openFilterDropdown(filterDropdown) {

    filterDropdown.classList.add('filter-dropdown--open')

    /* Lorsque le dropdown est fermé, on a un input de type bouton, 
    il faut le changer en text pour permettre à l'utilisateur de taper sa recherche
    */
    const inputElement = filterDropdown.querySelector('.filter-dropdown__input')
    setFilterDropdownInputAttribute(inputElement, 'text') 
    inputElement.focus()   

}

/* Ferme les éléments de filtre par tags 
    Paramètres :
        - Le filtre ouvert par l'utilisateur
    Renvoie :
        - Rien
*/
function closeOtherFilterDropdowns(filterDropdown) {

    filterDropdownsArray.forEach((element, index) => {

        if(element !== filterDropdown) {
            closeFilterDropdown(element, inputsInitialValues[index])
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
function addTag(clickedElement, tagName) {

    const tagElement = createTag(clickedElement, tagName);

    setTagElementBehaviour(tagElement, tagName)

    filterTagsElement.appendChild(tagElement);

    // Check si la liste de tags sélectionnés par le user est déjà visible ou non
    if(!filterTagsElement.className.includes('filters__tags--visible')) filterTagsElement.classList.add('filters__tags--visible')

    tagsSelectedNames.push(tagName)
}


/* Crée un élément contenant le nom d'un tag
    Paramètres :
        - Un élément venant d'être cliqué
        - Un texte correspondant au nom d'un tag
    Renvoie :
        - L'élement tag
*/
function createTag(clickedElement, tagName) {

    const dropdownElement = clickedElement.closest('.'+standardClassNameForFilterDropdown)
    const elementBackgroundColor = window.getComputedStyle(dropdownElement, null).getPropertyValue("background-color")

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
    tagElement.classList.add('tag')
    tagElement.style.backgroundColor = elementBackgroundColor

    return tagElement;
}


/* Définit le comportement d'un tag
    Paramètres :
        - Un élément correspondant à un tag
        - Un texte correspondant au nom du tag
    Renvoie :
        - Rien
*/
function setTagElementBehaviour(tagElement, tagName) {

    const closeButton = tagElement.querySelector('.tag__close')
    closeButton.addEventListener('click', () => {
        filterTagsElement.removeChild(tagElement)
        tagsSelectedNames = tagsSelectedNames.filter(name => name !== tagName)
    })

}


function setFiltersInputBehaviour() {

    const inputElements = document.getElementsByClassName('filter-dropdown__input'),
        inputElementsArray = Array.from(inputElements)

    inputElementsArray.forEach(input => {
        input.addEventListener('input', (e) => {

            const inputElement = e.target,
                inputValue = inputElement.value,
                inputName = inputElement.name
console.log(inputName)
            if(inputValue.length >= 3) {
                console.log(tagsPerType[inputName])
                const regexToMatch = new RegExp(inputValue, 'i')
                const matchedTags = tagsPerType[inputName].filter(tag => {
                    tag.match(regexToMatch)
                    if(tag.match(regexToMatch)) {
                        console.log(tag)
                        return tag
                    }
                } )
                console.log(matchedTags)
            }
                
        })
    })

}


export { setFilterDropdownsBehaviour, setFiltersInputBehaviour }
