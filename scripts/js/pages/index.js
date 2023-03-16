// --------------- FICHIER DE CONTRÔLE DE LA PAGE D'ACCUEIL ---------------

/** **************************** MODULES **************************************** */
/** ******************************************************************** */

import { createRecipes } from "../../templates/recipes.js";

import recipes from "../../../data/recipes.js"
import { filters } from "../utils/index.js";

createRecipes(recipes)

filters.setFilterDropdownsBehaviour()
