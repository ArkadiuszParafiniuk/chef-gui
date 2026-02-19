import type { Recipe } from '../types/recipe'

const BASE_URL = '/api'

export async function getAllRecipes(): Promise<Recipe[]> {
  const res = await fetch(`${BASE_URL}/recipe/getAll`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<Recipe[]>
}

export async function findRecipes(params: {
  title?: string
  typeOfDish?: string
  tags?: string[]
}): Promise<Recipe[]> {
  const qs = new URLSearchParams()
  if (params.title) qs.set('title', params.title)
  if (params.typeOfDish) qs.set('typeOfDish', params.typeOfDish)
  params.tags?.forEach((tag) => qs.append('tags', tag))

  const res = await fetch(`${BASE_URL}/recipe/find?${qs.toString()}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<Recipe[]>
}

export async function getRecipeByUuid(uuid: string): Promise<Recipe> {
  const res = await fetch(`${BASE_URL}/recipe/${uuid}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<Recipe>
}

export async function createRecipe(recipe: Recipe): Promise<Recipe> {
  const res = await fetch(`${BASE_URL}/recipe/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<Recipe>
}

export async function updateRecipe(uuid: string, recipe: Recipe): Promise<Recipe> {
  const res = await fetch(`${BASE_URL}/recipe/update/${uuid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<Recipe>
}

export async function findTags(tagName?: string): Promise<string[]> {
  const qs = new URLSearchParams()
  if (tagName) qs.set('tagName', tagName)
  const res = await fetch(`${BASE_URL}/recipeTag/find?${qs.toString()}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<string[]>
}

export async function incrementCookCount(uuid: string): Promise<Recipe> {
  const res = await fetch(`${BASE_URL}/recipe/${uuid}/cook`, { method: 'POST' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<Recipe>
}

export async function deleteRecipe(uuid: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/recipe/delete/${uuid}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function addPhoto(recipeUuid: string, image: File): Promise<void> {
  const formData = new FormData()
  formData.append('image', image)
  const res = await fetch(`${BASE_URL}/recipe/${recipeUuid}/addPhoto`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}
