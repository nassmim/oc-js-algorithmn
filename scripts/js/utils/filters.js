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
        listOfUniqueTags = listOfTags.map(tag => tag.toLowerCase())

    return listOfUniqueTags

}


/* Définit le comportement des boutons de filtre par tag lorsque l'utilisateur clique dessus
    Paramètres :
        - Aucun
    Renvoie :
        - Rien
*/
function setFilterDropdownsBehaviour() {

    filterDropdownsArray.forEach((filterDropdown, index) => {

        const inputElement = filterDropdown.querySelector('.filter-dropdown__input')

        // Crée la liste de tags associée au filtre
        createFilterDropdownTagsList(filterDropdown, tagsPerType[inputElement.name])

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
        setFilterDropdownInputBehaviour(filterDropdown, inputElement)
        
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
                createFilterDropdownTagsList(element, tagsPerType[inputElement.name])
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


/* Définit le comportement d'un input de filtre
    Paramètres :
        - Un élément HTML correspondant à un filtre
        - La valeur de l'attribut name de l'input associé au filtre
        - La valeur de l'attribut value de l'input associé au filtre
    Renvoie :
        - Rien
*/
function setFilterDropdownInputBehaviour(filterDropdown, inputElement) {

    inputElement.addEventListener('input', () => {

        const inputValue = inputElement.value,
            inputName = inputElement.name
 
        if(inputValue.length >= 3) {
        // L'utilisateur a tapé plus de trois lettres, on estime que c'est pertinent de lancer la recherche des tags 
    
            const regexToMatch = new RegExp(inputValue, 'i')
            const matchedTags = tagsPerType[inputName].filter(tag => tag.match(regexToMatch))
            
            // On crée de nouveau la liste de tags contenant seulement les tags retenus
            createFilterDropdownTagsList(filterDropdown, matchedTags)
    
        } else createFilterDropdownTagsList(filterDropdown, tagsPerType[inputName]) // La liste complète de tags doit être affichée

    })

}


export { setFilterDropdownsBehaviour }
