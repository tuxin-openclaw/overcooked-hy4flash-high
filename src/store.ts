import { create } from 'zustand'
import {
  CHOP_TIME,
  COOK_TIME,
  INTERACT_RADIUS,
  INGREDIENT_META,
  LEVEL_TIME,
  MAX_ORDERS,
  PLAYER_BOUNDS,
  PLAYER_SPEED,
  RECIPES,
  STATIONS,
  START_PLATES,
} from './constants'
import type {
  ChopSlot,
  Dish,
  Holdable,
  Ingredient,
  IngredientType,
  Order,
  StoveSlot,
  Toast,
  ToastTone,
} from './types'

let uidCounter = 0
let toastTimer: ReturnType<typeof setTimeout> | null = null

const nextUid = () => ++uidCounter

const sameIngredients = (a: IngredientType[], b: IngredientType[]) =>
  a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|')

const makeOrder = (elapsed: number): Order => {
  const pool = elapsed > 30 ? RECIPES : RECIPES.filter((r) => r.ingredients.length === 1)
  const recipe = pool[Math.floor(Math.random() * pool.length)]
  const maxTime = recipe.ingredients.length > 1 ? 80 : 58
  return { uid: nextUid(), recipe, timeLeft: maxTime, maxTime }
}

const makeSlots = () => {
  const chop: Record<string, ChopSlot> = {}
  const stove: Record<string, StoveSlot> = {}
  for (const st of STATIONS) {
    if (st.kind === 'chop') chop[st.id] = { item: null, progress: 0 }
    if (st.kind === 'stove') stove[st.id] = { item: null, progress: 0 }
  }
  return { chop, stove }
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export interface GameState {
  phase: 'start' | 'playing' | 'ended'
  timeLeft: number
  score: number
  served: number
  orders: Order[]
  player: { x: number; z: number; facing: number }
  held: Holdable
  chop: Record<string, ChopSlot>
  stove: Record<string, StoveSlot>
  plates: number
  nearStationId: string | null
  toast: Toast | null
  start: () => void
  tick: (dt: number, keys: Set<string>) => void
  interact: () => void
  showToast: (text: string, tone?: ToastTone) => void
}

export const useGame = create<GameState>((set, get) => ({
  phase: 'start',
  timeLeft: LEVEL_TIME,
  score: 0,
  served: 0,
  orders: [],
  player: { x: 0, z: 0.8, facing: Math.PI },
  held: null,
  chop: makeSlots().chop,
  stove: makeSlots().stove,
  plates: START_PLATES,
  nearStationId: null,
  toast: null,

  showToast: (text, tone = 'info') => {
    if (toastTimer) clearTimeout(toastTimer)
    const toast: Toast = { id: nextUid(), text, tone }
    set({ toast })
    toastTimer = setTimeout(() => {
      if (get().toast?.id === toast.id) set({ toast: null })
    }, 2200)
  },

  start: () => {
    const slots = makeSlots()
    set({
      phase: 'playing',
      timeLeft: LEVEL_TIME,
      score: 0,
      served: 0,
      orders: Array.from({ length: MAX_ORDERS }, () => makeOrder(0)),
      player: { x: 0, z: 0.8, facing: Math.PI },
      held: null,
      chop: slots.chop,
      stove: slots.stove,
      plates: START_PLATES,
      nearStationId: null,
      toast: null,
    })
  },

  tick: (dt, keys) => {
    const s = get()
    if (s.phase !== 'playing') return

    // ---- 移动 ----
    let dx = 0
    let dz = 0
    if (keys.has('w') || keys.has('arrowup')) dz -= 1
    if (keys.has('s') || keys.has('arrowdown')) dz += 1
    if (keys.has('a') || keys.has('arrowleft')) dx -= 1
    if (keys.has('d') || keys.has('arrowright')) dx += 1

    const len = Math.hypot(dx, dz)
    const player = { ...s.player }
    if (len > 0) {
      dx /= len
      dz /= len
      player.x = clamp(player.x + dx * PLAYER_SPEED * dt, PLAYER_BOUNDS.minX, PLAYER_BOUNDS.maxX)
      player.z = clamp(player.z + dz * PLAYER_SPEED * dt, PLAYER_BOUNDS.minZ, PLAYER_BOUNDS.maxZ)
      player.facing = Math.atan2(dx, dz)
    }

    // ---- 找最近工位 ----
    let nearStationId: string | null = null
    let bestDist = INTERACT_RADIUS
    for (const st of STATIONS) {
      const d = Math.hypot(st.position[0] - player.x, st.position[2] - player.z)
      if (d < bestDist) {
        bestDist = d
        nearStationId = st.id
      }
    }

    // ---- 切菜 / 烹饪进度 ----
    const chop: Record<string, ChopSlot> = {}
    for (const [id, slot] of Object.entries(s.chop)) {
      if (slot.item && slot.progress < 1) {
        const progress = Math.min(1, slot.progress + dt / CHOP_TIME)
        const item: Ingredient | null =
          progress >= 1 ? { ...slot.item, state: 'chopped' } : slot.item
        chop[id] = { item, progress }
      } else {
        chop[id] = slot
      }
    }
    const stove: Record<string, StoveSlot> = {}
    for (const [id, slot] of Object.entries(s.stove)) {
      if (slot.item && slot.progress < 1) {
        const progress = Math.min(1, slot.progress + dt / COOK_TIME)
        const item: Ingredient | null =
          progress >= 1 ? { ...slot.item, state: 'cooked' } : slot.item
        stove[id] = { item, progress }
      } else {
        stove[id] = slot
      }
    }

    // ---- 订单倒计时 ----
    const elapsed = LEVEL_TIME - s.timeLeft
    const alive = s.orders
      .map((o) => ({ ...o, timeLeft: o.timeLeft - dt }))
      .filter((o) => o.timeLeft > 0)
    const expired = s.orders.length - alive.length
    const orders = [...alive]
    while (orders.length < MAX_ORDERS) orders.push(makeOrder(elapsed + dt))
    let score = s.score
    if (expired > 0) {
      score = Math.max(0, score - expired * 15)
      get().showToast('订单超时，扣 15 分', 'bad')
    }

    const timeLeft = Math.max(0, s.timeLeft - dt)
    set({
      player,
      nearStationId,
      chop,
      stove,
      orders,
      score,
      timeLeft,
      phase: timeLeft <= 0 ? 'ended' : 'playing',
    })
    if (timeLeft <= 0) get().showToast('时间到！', 'info')
  },

  interact: () => {
    const s = get()
    if (s.phase !== 'playing' || !s.nearStationId) return
    const st = STATIONS.find((item) => item.id === s.nearStationId)
    if (!st) return

    const held = s.held
    const { chop, stove } = s
    const toast = (text: string, tone?: ToastTone) => get().showToast(text, tone)

    if (st.kind === 'crate') {
      if (held) return toast('手里已经有东西了', 'info')
      const type = st.ingredientType as IngredientType
      set({ held: { kind: 'ingredient', type, state: 'raw' } })
      return toast(`拿起${INGREDIENT_META[type].name}`, 'info')
    }

    if (st.kind === 'chop') {
      const slot = chop[st.id]
      if (held && held.kind === 'ingredient') {
        if (slot.item) return toast('切菜板被占用了', 'info')
        if (held.state !== 'raw') return toast('这个已经处理过了', 'info')
        set({ held: null, chop: { ...chop, [st.id]: { item: held, progress: 0 } } })
        return toast('开始切菜…', 'info')
      }
      if (!held) {
        if (!slot.item) return toast('切菜板是空的', 'info')
        if (slot.progress < 1) return toast('还没切好', 'info')
        set({ held: slot.item, chop: { ...chop, [st.id]: { item: null, progress: 0 } } })
        return toast('取到切好的食材', 'good')
      }
      return toast('盘子在手里，放不上菜板', 'info')
    }

    if (st.kind === 'stove') {
      const slot = stove[st.id]
      if (held && held.kind === 'ingredient' && held.state === 'chopped') {
        if (slot.item) return toast('锅里已经有食材了', 'info')
        set({ held: null, stove: { ...stove, [st.id]: { item: held, progress: 0 } } })
        return toast('下锅！', 'info')
      }
      if (held && held.kind === 'dish') {
        if (!slot.item || slot.item.state !== 'cooked') return toast('锅里还没有煮好的菜', 'info')
        const dish: Dish = { ...held, contents: [...held.contents, slot.item.type] }
        set({ held: dish, stove: { ...stove, [st.id]: { item: null, progress: 0 } } })
        return toast('装盘成功', 'good')
      }
      if (!held) {
        if (!slot.item) return toast('锅是空的', 'info')
        return toast('拿个盘子来装菜', 'info')
      }
      if (held.kind === 'ingredient' && held.state === 'raw') return toast('生食材要先切', 'info')
      return toast('先拿盘子装', 'info')
    }

    if (st.kind === 'plates') {
      if (held) return toast('先放下手里的东西', 'info')
      if (s.plates <= 0) return toast('没有干净盘子了', 'bad')
      set({ held: { kind: 'dish', contents: [] }, plates: s.plates - 1 })
      return toast('拿了一个盘子', 'info')
    }

    if (st.kind === 'serve') {
      if (!held || held.kind !== 'dish') return toast('端菜过来上桌', 'info')
      if (held.contents.length === 0) return toast('盘子是空的', 'info')
      const order = s.orders.find((o) => sameIngredients(o.recipe.ingredients, held.contents))
      if (!order) return toast('没有对应的订单', 'bad')
      const bonus = Math.round((order.timeLeft / order.maxTime) * 40)
      const gained = order.recipe.points + bonus
      const orders = [...s.orders.filter((o) => o.uid !== order.uid), makeOrder(LEVEL_TIME - s.timeLeft)]
      set({
        held: null,
        plates: s.plates + 1,
        score: s.score + gained,
        served: s.served + 1,
        orders,
      })
      return toast(`上菜成功 +${gained}`, 'good')
    }

    if (st.kind === 'trash') {
      if (!held) return toast('手里没东西', 'info')
      set({ plates: held.kind === 'dish' ? s.plates + 1 : s.plates, held: null })
      return toast('已丢弃', 'info')
    }
  },
}))
