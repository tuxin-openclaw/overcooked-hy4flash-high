import { Game } from './components/Game'
import { HUD } from './ui/HUD'
import './index.css'

export default function App() {
  return (
    <div className="app">
      <Game />
      <HUD />
    </div>
  )
}
