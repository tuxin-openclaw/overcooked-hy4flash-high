import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { STATIONS, STATION_HINT } from '../constants'
import { useGame } from '../store'
import type { IngredientType, Station } from '../types'
import { IngredientModel, Label, ProgressBar, Smoke, Sparkles } from './Models'

function Floor() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    const cell = 128
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#f6e7c6' : '#ecd5a6'
        ctx.fillRect(x * cell, y * cell, cell, cell)
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(6, 5)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial map={texture} roughness={0.95} />
      </mesh>
      {/* 中央装饰地毯 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <circleGeometry args={[2.1, 40]} />
        <meshStandardMaterial color="#fca5a5" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[1.72, 1.86, 40]} />
        <meshStandardMaterial color="#fecaca" roughness={1} />
      </mesh>
    </group>
  )
}

function Walls() {
  return (
    <group>
      <mesh position={[0, 1.8, -5.05]} receiveShadow>
        <boxGeometry args={[12, 3.6, 0.18]} />
        <meshStandardMaterial color="#fff3d6" roughness={0.9} />
      </mesh>
      <mesh position={[-6.05, 1.8, 0]} receiveShadow>
        <boxGeometry args={[0.18, 3.6, 10]} />
        <meshStandardMaterial color="#ffedc8" roughness={0.9} />
      </mesh>
      <mesh position={[6.05, 1.8, 0]} receiveShadow>
        <boxGeometry args={[0.18, 3.6, 10]} />
        <meshStandardMaterial color="#ffedc8" roughness={0.9} />
      </mesh>
      {/* 踢脚线 */}
      <mesh position={[0, 0.18, -4.93]}>
        <boxGeometry args={[12, 0.36, 0.1]} />
        <meshStandardMaterial color="#c98a4b" roughness={0.8} />
      </mesh>
      {[-5.93, 5.93].map((x) => (
        <mesh key={x} position={[x, 0.18, 0]}>
          <boxGeometry args={[0.1, 0.36, 10]} />
          <meshStandardMaterial color="#c98a4b" roughness={0.8} />
        </mesh>
      ))}
      {/* 后墙窗户 */}
      {[-3.6, 3.6].map((x) => (
        <group key={x} position={[x, 2.25, -4.93]}>
          <mesh>
            <boxGeometry args={[2.2, 1.45, 0.06]} />
            <meshStandardMaterial color="#7dd3fc" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[2.38, 0.12, 0.12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[0.12, 1.5, 0.12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, -0.78, 0.08]}>
            <boxGeometry args={[2.5, 0.14, 0.16]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      ))}
      {/* 墙上小彩旗 */}
      <group position={[0, 3.05, -4.9]}>
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[(i - 4) * 0.42, Math.abs(i - 4) * 0.045, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.14, 0.3, 3]} />
            <meshStandardMaterial
              color={['#f87171', '#fbbf24', '#60a5fa', '#4ade80', '#c084fc'][i % 5]}
              flatShading
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Flame() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.children.forEach((child, i) => {
      const t = clock.elapsedTime * 7 + i
      child.scale.set(0.8 + Math.sin(t) * 0.25, 1 + Math.sin(t) * 0.3, 0.8 + Math.cos(t) * 0.25)
    })
  })
  return (
    <group ref={ref} position={[0, 1.03, 0]}>
      {[-0.18, 0, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0, i % 2 ? 0.05 : -0.05]}>
          <coneGeometry args={[0.09, 0.25, 6]} />
          <meshBasicMaterial color={i === 1 ? '#fde047' : '#fb923c'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function StationVisual({ station, active }: { station: Station; active: boolean }) {
  const chopSlot = useGame((s) => s.chop[station.id])
  const stoveSlot = useGame((s) => s.stove[station.id])
  const plates = useGame((s) => s.plates)
  const [w, d] = station.size

  const bodyColor =
    station.kind === 'stove'
      ? '#94a3b8'
      : station.kind === 'trash'
        ? '#64748b'
        : station.kind === 'crate'
          ? '#b8c4cf'
          : '#cbd5e1'
  const topColor = station.kind === 'chop' ? '#b8793f' : '#d9a066'

  return (
    <group position={station.position}>
      {/* 柜体 + 台面 */}
      <RoundedBox args={[w, 0.92, d]} radius={0.08} smoothness={3} position={[0, 0.46, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={bodyColor} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[w + 0.06, 0.13, d + 0.06]} radius={0.05} smoothness={3} position={[0, 0.98, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={topColor} roughness={0.7} />
      </RoundedBox>

      {station.kind === 'crate' && (
        <group>
          <RoundedBox args={[1.05, 0.42, 0.85]} radius={0.07} smoothness={3} position={[0, 1.26, 0]} castShadow>
            <meshStandardMaterial color={station.color} roughness={0.75} />
          </RoundedBox>
          <RoundedBox args={[1.12, 0.09, 0.92]} radius={0.04} smoothness={3} position={[0, 1.5, 0]}>
            <meshStandardMaterial color={station.color} roughness={0.7} />
          </RoundedBox>
          {[-0.28, 0, 0.28].map((x, i) => (
            <group key={i} position={[x, 1.62, i % 2 ? 0.08 : -0.06]} scale={0.62}>
              <IngredientModel
                item={{ kind: 'ingredient', type: station.ingredientType as IngredientType, state: 'raw' }}
              />
            </group>
          ))}
        </group>
      )}

      {station.kind === 'chop' && (
        <group>
          <RoundedBox args={[0.95, 0.08, 0.72]} radius={0.04} smoothness={3} position={[0, 1.09, 0]} castShadow>
            <meshStandardMaterial color="#e0b277" roughness={0.85} />
          </RoundedBox>
          <mesh position={[-0.55, 1.16, -0.3]} rotation={[0, -0.5, 0]} castShadow>
            <boxGeometry args={[0.5, 0.035, 0.14]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[-0.82, 1.16, -0.18]} rotation={[0, -0.5, 0]} castShadow>
            <boxGeometry args={[0.2, 0.07, 0.09]} />
            <meshStandardMaterial color="#7c4a20" roughness={0.8} />
          </mesh>
          {chopSlot?.item && (
            <group position={[0, 1.22, 0]} scale={0.85}>
              <IngredientModel item={chopSlot.item} />
            </group>
          )}
          {chopSlot?.item && chopSlot.progress < 1 && (
            <>
              <Sparkles y={1.55} />
              <ProgressBar progress={chopSlot.progress} position={[0, 1.82, 0]} />
            </>
          )}
        </group>
      )}

      {station.kind === 'stove' && (
        <group>
          <mesh position={[0, 1.06, 0]} receiveShadow>
            <boxGeometry args={[1.16, 0.06, 1.5]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.19, 0]} castShadow>
            <cylinderGeometry args={[0.44, 0.38, 0.2, 20]} />
            <meshStandardMaterial color="#475569" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.37, 0.37, 0.02, 20]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.27, 0.62]} castShadow>
            <boxGeometry args={[0.46, 0.055, 0.12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          {stoveSlot?.item && (
            <group position={[0, 1.38, 0]} scale={0.8}>
              <IngredientModel item={stoveSlot.item} />
            </group>
          )}
          {stoveSlot?.item && stoveSlot.progress < 1 && (
            <>
              <Flame />
              <Smoke y={1.55} />
              <ProgressBar progress={stoveSlot.progress} position={[0, 1.88, 0]} color="#fb923c" />
            </>
          )}
        </group>
      )}

      {station.kind === 'plates' && (
        <group>
          {Array.from({ length: Math.min(plates, 5) }).map((_, i) => (
            <mesh key={i} position={[0, 1.08 + i * 0.09, 0]} castShadow>
              <cylinderGeometry args={[0.38, 0.34, 0.07, 20]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.45} />
            </mesh>
          ))}
          <mesh position={[0, 1.06, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.04, 20]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.6} />
          </mesh>
        </group>
      )}

      {station.kind === 'serve' && (
        <group>
          <RoundedBox args={[1.35, 0.1, 0.9]} radius={0.04} smoothness={3} position={[0, 1.09, 0]} castShadow>
            <meshStandardMaterial color="#fcd34d" roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 1.24, -0.15]} castShadow>
            <cylinderGeometry args={[0.16, 0.2, 0.16, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.38, -0.15]}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial color="#fef3c7" metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
      )}

      {station.kind === 'trash' && (
        <group>
          <mesh position={[0, 1.22, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.34, 0.5, 14]} />
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.44, 0.44, 0.07, 14]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.57, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.08, 10]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
      )}

      <Label
        text={active ? `E · ${STATION_HINT[station.kind]}` : station.label}
        bg={active ? '#fbbf24' : '#27364a'}
        fg={active ? '#1f2937' : '#ffffff'}
        width={active ? 1.7 : 1.15}
        position={[0, 1.82, 0]}
      />
      {active && <Sparkles y={2.08} color="#fde047" />}
    </group>
  )
}

export function Kitchen() {
  const nearStationId = useGame((s) => s.nearStationId)
  return (
    <group>
      <ambientLight intensity={0.78} />
      <hemisphereLight args={['#ffffff', '#d8b98a', 0.45]} />
      <directionalLight
        castShadow
        position={[6, 12, 7]}
        intensity={1.25}
        color="#fff6e5"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-bias={-0.0004}
      />
      <Floor />
      <Walls />
      {STATIONS.map((st) => (
        <StationVisual key={st.id} station={st} active={nearStationId === st.id} />
      ))}
      <ContactShadows position={[0, 0.02, 0]} opacity={0.28} scale={16} blur={2.6} far={4} resolution={512} />
    </group>
  )
}
