import { useEffect, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGame } from '../store'
import { Kitchen } from './Kitchen'
import { Player } from './Player'

function GameLoop({ keys }: { keys: MutableRefObject<Set<string>> }) {
  useFrame((_, delta) => {
    useGame.getState().tick(Math.min(delta, 0.1), keys.current)
  })
  return null
}

export function Game() {
  const keys = useRef<Set<string>>(new Set())

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e', ' '].includes(k)) {
        e.preventDefault()
      }
      keys.current.add(k)
      if (k === 'e' && !e.repeat) useGame.getState().interact()
    }
    const up = (e: KeyboardEvent) => {
      keys.current.delete(e.key.toLowerCase())
    }
    const blur = () => keys.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 11.5, 13], fov: 42, near: 0.1, far: 80 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.4, 0)}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#fdf1d5']} />
      <fog attach="fog" args={['#fdf1d5', 26, 46]} />
      <Kitchen />
      <Player />
      <GameLoop keys={keys} />
    </Canvas>
  )
}
