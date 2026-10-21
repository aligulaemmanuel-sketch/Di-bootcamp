import type RecipeItem from '../model/RecipeItem'

export interface RecipeHandlers {
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
}

export default class RecipeTemplate {
  // Remember which cards are expanded so re-rendering keeps them open.
  private expandedIds = new Set<string>()

  constructor(
    private readonly container: HTMLElement,
    private readonly handlers: RecipeHandlers,
  ) {}

  render(recipes: RecipeItem[]): void {
    this.container.replaceChildren()

    if (recipes.length === 0) {
      const empty = document.createElement('p')
      empty.className = 'empty'
      empty.textContent = 'No recipes yet. Add your first one above!'
      this.container.append(empty)
      return
    }

    recipes.forEach((recipe) => this.container.append(this.createCard(recipe)))
  }

  private createCard(recipe: RecipeItem): HTMLElement {
    const card = document.createElement('article')
    card.className = 'recipe-card'
    if (recipe.isFavorite) card.classList.add('favorite')

    // Header: title + action buttons
    const header = document.createElement('div')
    header.className = 'recipe-header'

    const title = document.createElement('h2')
    title.textContent = recipe.title

    const actions = document.createElement('div')
    actions.className = 'recipe-actions'

    const favoriteButton = document.createElement('button')
    favoriteButton.type = 'button'
    favoriteButton.textContent = recipe.isFavorite ? '★ Unfavorite' : '☆ Favorite'
    favoriteButton.addEventListener('click', () => this.handlers.onToggleFavorite(recipe.id))

    const toggleButton = document.createElement('button')
    toggleButton.type = 'button'

    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'danger'
    deleteButton.textContent = 'Delete'
    deleteButton.addEventListener('click', () => this.handlers.onDelete(recipe.id))

    actions.append(favoriteButton, toggleButton, deleteButton)
    header.append(title, actions)

    // Details: ingredients + instructions (shown/hidden)
    const details = document.createElement('div')
    details.className = 'recipe-details'

    const ingredientsHeading = document.createElement('h3')
    ingredientsHeading.textContent = 'Ingredients'

    const ingredientList = document.createElement('ul')
    recipe.ingredients.forEach((ingredient) => {
      const item = document.createElement('li')
      item.textContent = ingredient
      ingredientList.append(item)
    })

    const instructionsHeading = document.createElement('h3')
    instructionsHeading.textContent = 'Instructions'

    const instructions = document.createElement('p')
    instructions.className = 'instructions'
    instructions.textContent = recipe.instructions

    details.append(ingredientsHeading, ingredientList, instructionsHeading, instructions)

    const setExpanded = (expanded: boolean): void => {
      details.hidden = !expanded
      toggleButton.textContent = expanded ? 'Hide details' : 'Show details'
    }

    setExpanded(this.expandedIds.has(recipe.id))
    toggleButton.addEventListener('click', () => {
      const nowExpanded = details.hidden
      if (nowExpanded) this.expandedIds.add(recipe.id)
      else this.expandedIds.delete(recipe.id)
      setExpanded(nowExpanded)
    })

    card.append(header, details)
    return card
  }
}
