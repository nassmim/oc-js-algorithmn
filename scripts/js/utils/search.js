// --------------- FICHIER DE CONTRÔLE DE LA FONCTIONNALITÉ DE RECHERCHE ---------------

/** **************************** MODULES **************************************** */
/** ******************************************************************** */

import recipes from "../../../data/recipes.js"

import { filterTags, getTagsFromRecipes, recipesFiltered, tagsSelectedElementArray } from "./filters.js"

let recipesSearched = []

const searchInput = document.querySelector('.search-main__input')

export { searchInput, recipesSearched }