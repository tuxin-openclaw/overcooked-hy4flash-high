import { useGame } from '../store'
import { ChefModel } from './Models'

export function Player() {
  const player = useGame((s) => s.player)
  const held = useGame((s) => s.held)

  return (
    <group position={[player.x, 0, player.z]}>
      <ChefModel facing={player.facing} held={held} />
    </group>
  )
}
