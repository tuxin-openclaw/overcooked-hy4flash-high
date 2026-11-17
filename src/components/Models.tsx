import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { INGREDIENT_META } from '../constants'
import type { Dish, Holdable, Ingredient, IngredientType } from '../types'

type Vec3 = [number, number, number]

function useLabelTexture(text: string, bg: string, fg: string) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 80
    const ctx = canvas.getContext('2d')!
    const r = 20
    const w = canvas.width
    const h = canvas.height
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.lineTo(w - r, 0)
    ctx.quadraticCurveTo(w, 0, w, r)
    ctx.lineTo(w, h - r)
    ctx.quadraticCurveTo(w, h, w - r, h)
    ctx.lineTo(r, h)
    ctx.quadraticCurveTo(0, h, 0, h - r)
    ctx.lineTo(0, r)
    ctx.quadraticCurveTo(0, 0, r, 0)
    ctx.fill()
    ctx.fillStyle = fg
    ctx.font = 'bold 44px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, w / 2, h / 2 + 2)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [text, bg, fg])
}

export function Label({
  text,
  bg = '#1f2937',
  fg = '#ffffff',
  width = 1.15,
  height = 0.3,
  position = [0, 0, 0],
}: {
  text: string
  bg?: string
  fg?: string
  width?: number
  height?: number
  position?: Vec3
}) {
  const tex = useLabelTexture(text, bg, fg)
  return (
    <Billboard position={position}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </Billboard>
  )
}

export function ProgressBar({
  progress,
  position,
  color = '#4ade80',
}: {
  progress: number
  position: Vec3
  color?: string
}) {
  const p = Math.max(0.001, Math.min(1, progress))
  return (
    <Billboard position={position}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[0.92, 0.14]} />
        <meshBasicMaterial color="#1f2937" depthTest={false} toneMapped={false} />
      </mesh>
      <mesh position={[-(1 - p) * 0.45, 0, 0.01]} scale={[p, 1, 1]}>
        <planeGeometry args={[0.9, 0.11]} />
        <meshBasicMaterial color={color} depthTest={false} toneMapped={false} />
      </mesh>
    </Billboard>
  )
}

function WholeIngredient({
  type,
  color,
  leaf,
  scale = 1,
}: {
  type: IngredientType
  color: string
  leaf: string
  scale?: number
}) {
  if (type === 'tomato') {
    return (
      <group scale={scale}>
        <mesh castShadow>
          <sphereGeometry args={[0.27, 16, 12]} />
          <meshStandardMaterial color={color} flatShading roughness={0.55} />
        </mesh>
        <mesh castShadow position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.045, 0.07, 0.09, 5]} />
          <meshStandardMaterial color={leaf} flatShading />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[Math.cos((i * Math.PI) / 2) * 0.12, 0.235, Math.sin((i * Math.PI) / 2) * 0.12]}
            rotation={[0, (i * Math.PI) / 2, 0.35]}
            castShadow
          >
            <boxGeometry args={[0.17, 0.025, 0.07]} />
            <meshStandardMaterial color={leaf} flatShading />
          </mesh>
        ))}
      </group>
    )
  }

  if (type === 'lettuce') {
    return (
      <group scale={scale}>
        <mesh castShadow>
          <sphereGeometry args={[0.26, 14, 10]} />
          <meshStandardMaterial color={color} flatShading roughness={0.75} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI * 2) / 5) * 0.16,
              0.06 + (i % 2) * 0.08,
              Math.sin((i * Math.PI * 2) / 5) * 0.16,
            ]}
            rotation={[0.3, (i * Math.PI * 2) / 5, 0.5]}
            castShadow
          >
            <sphereGeometry args={[0.14, 10, 8]} />
            <meshStandardMaterial color={leaf} flatShading roughness={0.8} />
          </mesh>
        ))}
      </group>
    )
  }

  if (type === 'meat') {
    return (
      <group scale={scale} rotation={[0, 0.3, 0]}>
        <RoundedBox args={[0.52, 0.2, 0.44]} radius={0.09} smoothness={3} castShadow>
          <meshStandardMaterial color={color} flatShading roughness={0.7} />
        </RoundedBox>
        <mesh position={[0, 0.11, 0]} rotation={[0, 0.25, 0]}>
          <boxGeometry args={[0.44, 0.02, 0.055]} />
          <meshStandardMaterial color="#ffe4e6" />
        </mesh>
        <mesh position={[0, 0.11, 0.13]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.05]} />
          <meshStandardMaterial color="#ffe4e6" />
        </mesh>
      </group>
    )
  }

  return (
    <group scale={scale} rotation={[0, 0.5, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.28, 3]} />
        <meshStandardMaterial color={color} flatShading roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.23, 0.06, 3]} />
        <meshStandardMaterial color={leaf} flatShading />
      </mesh>
    </group>
  )
}

function ChoppedIngredient({
  type,
  color,
  scale = 1,
}: {
  type: IngredientType
  color: string
  scale?: number
}) {
  const pieces: Vec3[] = [
    [-0.13, 0.02, 0.09],
    [0.13, 0.02, 0.06],
    [0.0, 0.02, -0.13],
    [0.1, 0.02, -0.1],
  ]
  return (
    <group scale={scale}>
      {pieces.map((p, i) => (
        <mesh key={i} position={p} rotation={[0, i * 0.7, 0]} castShadow>
          {type === 'meat' || type === 'cheese' ? (
            <boxGeometry args={[0.16, 0.11, 0.16]} />
          ) : (
            <sphereGeometry args={[0.11, 10, 8]} />
          )}
          <meshStandardMaterial color={color} flatShading roughness={0.65} />
        </mesh>
      ))}
    </group>
  )
}

export function IngredientModel({ item, scale = 1 }: { item: Ingredient; scale?: number }) {
  const meta = INGREDIENT_META[item.type]
  const color =
    item.state === 'burnt' ? '#3f3f46' : item.state === 'cooked' ? meta.dark : meta.color
  if (item.state === 'chopped') {
    return <ChoppedIngredient type={item.type} color={color} scale={scale} />
  }
  return <WholeIngredient type={item.type} color={color} leaf={meta.leaf} scale={scale} />
}

export function DishModel({ dish, scale = 1 }: { dish: Dish; scale?: number }) {
  return (
    <group scale={scale}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.34, 0.09, 24]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.035, 8, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      {dish.contents.map((type, i) => (
        <group key={`${type}-${i}`} position={[i % 2 === 0 ? -0.13 : 0.13, 0.12, i > 1 ? -0.1 : 0.08]}>
          <WholeIngredient
            type={type}
            color={INGREDIENT_META[type].dark}
            leaf={INGREDIENT_META[type].leaf}
            scale={0.5}
          />
        </group>
      ))}
    </group>
  )
}

export function HeldModel({ held, scale = 0.75 }: { held: Holdable; scale?: number }) {
  if (!held) return null
  if (held.kind === 'dish') return <DishModel dish={held} scale={scale} />
  return <IngredientModel item={held} scale={scale} />
}

export function ChefModel({ facing, held }: { facing: number; held: Holdable }) {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      facing,
      0.18,
    )
    group.current.position.y = Math.sin(clock.elapsedTime * 3) * 0.025
  })

  return (
    <group ref={group}>
      {/* 身体：圆润厨师服 */}
      <RoundedBox args={[0.78, 0.82, 0.58]} radius={0.22} smoothness={4} position={[0, 0.62, 0]} castShadow>
        <meshStandardMaterial color="#fefefe" roughness={0.85} />
      </RoundedBox>
      {/* 围裙 */}
      <RoundedBox args={[0.56, 0.56, 0.06]} radius={0.1} smoothness={3} position={[0, 0.56, 0.31]} castShadow>
        <meshStandardMaterial color="#ef4444" roughness={0.8} />
      </RoundedBox>
      {/* 头 */}
      <mesh position={[0, 1.32, 0]} castShadow>
        <sphereGeometry args={[0.33, 16, 12]} />
        <meshStandardMaterial color="#ffd7b0" flatShading roughness={0.9} />
      </mesh>
      {/* 眼睛 */}
      {[-0.12, 0.12].map((x) => (
        <mesh key={x} position={[x, 1.36, 0.3]}>
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}
      {/* 腮红 */}
      {[-0.23, 0.23].map((x) => (
        <mesh key={x} position={[x, 1.27, 0.245]} scale={[1, 0.6, 0.3]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshStandardMaterial color="#fb7185" />
        </mesh>
      ))}
      {/* 厨师帽 */}
      <mesh position={[0, 1.63, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.22, 14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      {[
        [0, 1.82, 0, 0.2],
        [-0.15, 1.76, 0.05, 0.15],
        [0.15, 1.77, -0.03, 0.15],
        [0, 1.78, 0.16, 0.14],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
      ))}
      {/* 手 */}
      {[-0.46, 0.46].map((x) => (
        <mesh key={x} position={[x, 0.82, 0.16]} castShadow>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color="#ffd7b0" flatShading />
        </mesh>
      ))}
      {/* 脚 */}
      {[-0.2, 0.2].map((x) => (
        <RoundedBox
          key={x}
          args={[0.24, 0.16, 0.34]}
          radius={0.06}
          smoothness={3}
          position={[x, 0.08, 0.08]}
          castShadow
        >
          <meshStandardMaterial color="#1f2937" roughness={0.9} />
        </RoundedBox>
      ))}
      {/* 手持物 */}
      {held && (
        <group position={[0, 0.98, 0.62]}>
          <HeldModel held={held} />
        </group>
      )}
    </group>
  )
}

export function Sparkles({ color = '#fde047', y = 1.35 }: { color?: string; y?: number }) {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.rotation.y = clock.elapsedTime * 2.5
    group.current.position.y = y + Math.sin(clock.elapsedTime * 6) * 0.05
  })
  return (
    <group ref={group} position={[0, y, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[Math.cos((i * Math.PI * 2) / 3) * 0.22, 0, Math.sin((i * Math.PI * 2) / 3) * 0.22]}
          rotation={[0.4, i, 0.6]}
        >
          <boxGeometry args={[0.09, 0.09, 0.09]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export function Smoke({ y = 1.35 }: { y?: number }) {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime
    group.current.children.forEach((child, i) => {
      child.position.y = ((t * 0.5 + i * 0.35) % 1) * 0.7
      const s = 0.1 + ((t * 0.5 + i * 0.35) % 1) * 0.12
      child.scale.setScalar(s)
    })
  })
  return (
    <group ref={group} position={[0, y, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.08 * (i - 1), 0, 0]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
