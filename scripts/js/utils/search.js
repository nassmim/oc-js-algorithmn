import recipes from "../../../data/recipes.js"

let recipesSearched = [],
    recipesFiltered = []

const searchInput = document.querySelector('.search-main__input')


searchInput.addEventListener('input', () => {

    const searchText = searchInput.value
    recipesSearched = searchRecipes(searchText)
    
})





function searchRecipes(searchText) {

    const recipesToSearchFrom = recipesFiltered.length ? recipesFiltered : recipes

    const recipesFound = recipesToSearchFrom.reduce((listOfRecipes, recipe) => {

        const ingredients = recipe.ingredients.map(ingredient => ingredient.ingredient),
            ingredientsString = ingredients.join(' ')

        // Solution à adopter si le texte cherché ne doit pas forcément se retrouver au début du mot
        // const regexToMatch = new RegExp(searchText, 'i')
        // const textsToSearchIn = `${recipe.name} ${ingredientsString} ${recipe.description}`
        // const recipeMatchRegex = textsToSearchIn.match(regexToMatch)

        const regexToMatch = new RegExp('\^' + searchText, 'i')
        let recipeMatchRegex = recipe.name.match(regexToMatch) || ingredientsString.match(regexToMatch) || recipe.description.match(regexToMatch)
        ingredients.forEach(ingredient => recipeMatchRegex || ingredient.match(regexToMatch))

        return recipeMatchRegex ? listOfRecipes.concat(recipe) : listOfRecipes

    }, [])

    return recipesFound

}

export { searchRecipes, searchInput, recipesSearched }