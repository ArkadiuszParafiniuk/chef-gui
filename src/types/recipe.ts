export type TypeOfDish = 'BREAKFAST' | 'DINNER' | 'DESSERT' | 'DRINK'

export interface Ingredient {
  ingredient: string
  amount: string
}

/** Spring Boot / MongoDB Binary serialized via Jackson */
export interface Binary {
  type?: number | string
  data?: string | string[]
}

export interface Recipe {
  uuid: string
  title: string
  content?: string
  ingredients?: Ingredient[]
  typeOfDish?: TypeOfDish
  tags?: string[]
  images?: Binary[]
}
