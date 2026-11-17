// 游戏核心类型定义

export type IngredientType = 'tomato' | 'lettuce' | 'meat' | 'cheese'
export type ItemState = 'raw' | 'chopped' | 'cooked' | 'burnt'

export interface Ingredient {
  kind: 'ingredient'
  type: IngredientType
  state: ItemState
}

export interface Dish {
  kind: 'dish'
  contents: IngredientType[]
}

export type Holdable = Ingredient | Dish | null

export type StationKind = 'crate' | 'chop' | 'stove' | 'plates' | 'serve' | 'trash'

export interface Station {
  id: string
  kind: StationKind
  label: string
  position: [number, number, number]
  size: [number, number]
  ingredientType?: IngredientType
  color: string
}

export interface ChopSlot {
  item: Ingredient | null
  progress: number
}

export interface StoveSlot {
  item: Ingredient | null
  progress: number
}

export interface Recipe {
  id: string
  name: string
  ingredients: IngredientType[]
  color: string
  points: number
}

export interface Order {
  uid: number
  recipe: Recipe
  timeLeft: number
  maxTime: number
}

export type ToastTone = 'good' | 'bad' | 'info'

export interface Toast {
  id: number
  text: string
  tone: ToastTone
}
