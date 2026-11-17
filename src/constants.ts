import type { IngredientType, Recipe, Station, StationKind } from './types'

export const INGREDIENT_META: Record<
  IngredientType,
  { name: string; color: string; dark: string; leaf: string }
> = {
  tomato: { name: '番茄', color: '#ef4444', dark: '#b91c1c', leaf: '#22c55e' },
  lettuce: { name: '生菜', color: '#a3e635', dark: '#4d7c0f', leaf: '#65a30d' },
  meat: { name: '牛肉', color: '#f871a0', dark: '#be185d', leaf: '#fb7185' },
  cheese: { name: '芝士', color: '#facc15', dark: '#ca8a04', leaf: '#fbbf24' },
}

export const RECIPES: Recipe[] = [
  { id: 'soup', name: '番茄浓汤', ingredients: ['tomato'], color: '#ef4444', points: 120 },
  { id: 'salad', name: '田园沙拉', ingredients: ['lettuce'], color: '#84cc16', points: 120 },
  { id: 'steak', name: '香煎牛排', ingredients: ['meat'], color: '#f472b6', points: 140 },
  { id: 'cheese', name: '芝士焗饭', ingredients: ['cheese'], color: '#facc15', points: 140 },
  { id: 'margherita', name: '番茄芝士煲', ingredients: ['tomato', 'cheese'], color: '#fb923c', points: 220 },
  { id: 'beefSalad', name: '牛肉沙拉', ingredients: ['meat', 'lettuce'], color: '#a3e635', points: 220 },
]

export const STATION_HINT: Record<StationKind, string> = {
  crate: '拿取食材',
  chop: '切菜 / 取菜',
  stove: '下锅 / 装盘',
  plates: '拿空盘子',
  serve: '上菜',
  trash: '丢弃',
}

const crate = (type: IngredientType, x: number): Station => ({
  id: `crate-${type}`,
  kind: 'crate',
  label: `${INGREDIENT_META[type].name}箱`,
  ingredientType: type,
  position: [x, 0, -3.9],
  size: [1.9, 1.4],
  color: INGREDIENT_META[type].color,
})

export const STATIONS: Station[] = [
  crate('tomato', -4.2),
  crate('lettuce', -1.4),
  crate('meat', 1.4),
  crate('cheese', 4.2),
  { id: 'chop-1', kind: 'chop', label: '切菜板', position: [-5.1, 0, -1.6], size: [1.4, 1.9], color: '#d9a066' },
  { id: 'chop-2', kind: 'chop', label: '切菜板', position: [-5.1, 0, 1.4], size: [1.4, 1.9], color: '#d9a066' },
  { id: 'stove-1', kind: 'stove', label: '灶台', position: [5.1, 0, -1.6], size: [1.4, 1.9], color: '#64748b' },
  { id: 'stove-2', kind: 'stove', label: '灶台', position: [5.1, 0, 1.4], size: [1.4, 1.9], color: '#64748b' },
  { id: 'plates', kind: 'plates', label: '盘子架', position: [-4.2, 0, 3.9], size: [1.9, 1.4], color: '#38bdf8' },
  { id: 'serve', kind: 'serve', label: '上菜口', position: [0, 0, 3.9], size: [1.9, 1.4], color: '#fbbf24' },
  { id: 'trash', kind: 'trash', label: '垃圾桶', position: [4.2, 0, 3.9], size: [1.9, 1.4], color: '#94a3b8' },
]

export const ROOM = { width: 12, depth: 10 }
export const PLAYER_BOUNDS = { minX: -4, maxX: 4, minZ: -2.6, maxZ: 2.6 }
export const INTERACT_RADIUS = 2.25
export const PLAYER_SPEED = 4.2

export const CHOP_TIME = 2.2
export const COOK_TIME = 3.6
export const LEVEL_TIME = 180
export const MAX_ORDERS = 3
export const START_PLATES = 3
