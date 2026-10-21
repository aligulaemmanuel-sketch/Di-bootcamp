import './style.css'
import RecipeItem from './model/RecipeItem'
import RecipeCollection from './model/RecipeCollection'
import RecipeTemplate from './templates/RecipeTemplate'

/** Find an element by id or fail loudly if the HTML is missing it. */
function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)
  if (!element) throw new Error(`Element #${id} not found`)
  return element as T
}

function initApp(): void {
  const form = getElement<HTMLFormElement>('recipeEntryForm')
  const titleInput = getElement<HTMLInputElement>('recipeTitle')
  const ingredientsInput = getElement<HTMLTextAreaElement>('ingredients')
  const instructionsInput = getElement<HTMLTextAreaElement>('instructions')
  const container = getElement<HTMLDivElement>('recipeContainer')
  const clearButton = getElement<HTMLButtonElement>('clearRecipesButton')

  const collection = new RecipeCollection()
  collection.load()

  const template = new RecipeTemplate(container, {
    onToggleFavorite: (id) => {
      collection.toggleFavorite(id)
      template.render(collection.recipes)
    },
    onDelete: (id) => {
      collection.removeRecipe(id)
      template.render(collection.recipes)
    },
  })

  form.addEventListener('submit', (event: SubmitEvent) => {
    event.preventDefault()

    const title = titleInput.value.trim()
    const instructions = instructionsInput.value.trim()
    const ingredients = ingredientsInput.value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (!title || !instructions || ingredients.length === 0) return

    collection.addRecipe(RecipeItem.create(title, ingredients, instructions))
    template.render(collection.recipes)
    form.reset()
    titleInput.focus()
  })

  clearButton.addEventListener('click', () => {
    if (collection.recipes.length === 0) return
    if (!window.confirm('Delete all recipes? This cannot be undone.')) return
    collection.clear()
    template.render(collection.recipes)
  })

  template.render(collection.recipes)
}

initApp()
