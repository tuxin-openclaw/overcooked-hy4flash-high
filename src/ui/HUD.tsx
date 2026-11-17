import { INGREDIENT_META, STATIONS, STATION_HINT } from '../constants'
import { useGame } from '../store'
import type { Holdable } from '../types'

function describeHeld(held: Holdable): string {
  if (!held) return '空手'
  if (held.kind === 'dish') {
    if (held.contents.length === 0) return '空盘子'
    return `盘子 · ${held.contents.map((t) => INGREDIENT_META[t].name).join(' + ')}`
  }
  const prefix = held.state === 'raw' ? '生' : held.state === 'chopped' ? '切好' : '煮熟'
  return `${prefix}${INGREDIENT_META[held.type].name}`
}

function StartScreen() {
  return (
    <div className="overlay">
      <div className="panel start-panel">
        <div className="title">胡闹厨房</div>
        <div className="subtitle">OVERCOOKED-LIKE · 3D 卡通厨房</div>
        <div className="steps">
          {[
            ['1', '到食材箱拿起食材'],
            ['2', '到切菜板切成段'],
            ['3', '放上灶台煮熟'],
            ['4', '拿盘子装好熟菜'],
            ['5', '端去上菜口交付'],
          ].map(([n, text]) => (
            <div className="step" key={n}>
              <span className="step-num">{n}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <div className="keys-hint">
          <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 移动</span>
          <span><kbd>E</kbd> 交互</span>
          <span>限时 3 分钟，尽量多上菜</span>
        </div>
        <button className="play-btn" onClick={() => useGame.getState().start()}>
          开始游戏 ⚡
        </button>
      </div>
    </div>
  )
}

function EndScreen() {
  const score = useGame((s) => s.score)
  const served = useGame((s) => s.served)
  return (
    <div className="overlay">
      <div className="panel end-panel">
        <div className="title">时间到！</div>
        <div className="subtitle">本局营业结束</div>
        <div className="result">
          <div className="result-item">
            <span className="result-label">总分</span>
            <span className="result-value accent">{score}</span>
          </div>
          <div className="result-item">
            <span className="result-label">完成订单</span>
            <span className="result-value">{served}</span>
          </div>
        </div>
        <button className="play-btn" onClick={() => useGame.getState().start()}>
          再来一局 ⚡
        </button>
      </div>
    </div>
  )
}

export function HUD() {
  const phase = useGame((s) => s.phase)
  const timeLeft = useGame((s) => s.timeLeft)
  const score = useGame((s) => s.score)
  const served = useGame((s) => s.served)
  const plates = useGame((s) => s.plates)
  const orders = useGame((s) => s.orders)
  const held = useGame((s) => s.held)
  const nearStationId = useGame((s) => s.nearStationId)
  const toast = useGame((s) => s.toast)

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(Math.floor(timeLeft % 60)).padStart(2, '0')
  const nearStation = STATIONS.find((s) => s.id === nearStationId)

  return (
    <div className="hud">
      {phase === 'playing' && (
        <>
          <div className="topbar">
            <div className="stat">
              <span className="stat-label">剩余时间</span>
              <span className={`stat-value ${timeLeft < 30 ? 'danger' : ''}`}>{mm}:{ss}</span>
            </div>
            <div className="stat">
              <span className="stat-label">得分</span>
              <span className="stat-value accent">{score}</span>
            </div>
            <div className="stat">
              <span className="stat-label">已上菜</span>
              <span className="stat-value">{served}</span>
            </div>
            <div className="stat">
              <span className="stat-label">干净盘子</span>
              <span className="stat-value">{plates}</span>
            </div>
          </div>

          <div className="orders">
            <div className="orders-title">当前订单</div>
            {orders.map((o) => {
              const ratio = Math.max(0, o.timeLeft / o.maxTime)
              const barColor = ratio < 0.25 ? '#ef4444' : ratio < 0.5 ? '#fbbf24' : '#4ade80'
              return (
                <div className={`order-card ${ratio < 0.25 ? 'urgent' : ''}`} key={o.uid}>
                  <div className="order-head">
                    <span className="order-name" style={{ color: o.recipe.color }}>
                      {o.recipe.name}
                    </span>
                    <span className="order-points">+{o.recipe.points}</span>
                  </div>
                  <div className="order-middle">
                    <div className="order-ings">
                      {o.recipe.ingredients.map((t, i) => (
                        <span
                          className="ing-chip"
                          key={`${t}-${i}`}
                          style={{ background: INGREDIENT_META[t].color }}
                          title={INGREDIENT_META[t].name}
                        >
                          {INGREDIENT_META[t].name[0]}
                        </span>
                      ))}
                    </div>
                    <span className="order-timer">{Math.ceil(o.timeLeft)}s</span>
                  </div>
                  <div className="order-bar">
                    <div style={{ width: `${ratio * 100}%`, background: barColor }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bottombar">
            <div className="held-card">
              <span className="held-label">手持</span>
              <span className="held-value">{describeHeld(held)}</span>
            </div>
            <div className="controls">
              <span><kbd>WASD</kbd> 移动</span>
              <span><kbd>E</kbd> 交互</span>
              {nearStation && (
                <span className="near-hint">
                  按 <kbd>E</kbd> {STATION_HINT[nearStation.kind]}
                </span>
              )}
            </div>
          </div>

          {toast && <div className={`toast ${toast.tone}`}>{toast.text}</div>}
        </>
      )}

      {phase === 'start' && <StartScreen />}
      {phase === 'ended' && <EndScreen />}
    </div>
  )
}
