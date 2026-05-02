import { useState, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './lib/wagmi'
import { useAccount } from 'wagmi'
import WalletButton from './components/WalletButton'
import Dashboard from './components/Dashboard'
import Vesting from './components/Vesting'
import Govern from './components/Govern'
import Swap from './components/Swap'
import { useChonkBalance, fmt } from './hooks/useChonk'
import { CHONK_ADDRESS, POOL_ADDRESS } from './abis'

const queryClient = new QueryClient()

// ── Particles ────────────────────────────────────────────────────────────────
const Particles = () => {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, dur: Math.random() * 10 + 8, delay: Math.random() * 5,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: 'rgba(255,200,50,0.12)',
          animation: `float ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
        }} />
      ))}
    </div>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────
const TABS = ['Dashboard', 'Vesting', 'Govern', 'Swap']

function Nav({ active, setActive }) {
  const { data: balance } = useChonkBalance()
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 32px', borderBottom: '1px solid rgba(255,200,50,0.12)',
      background: 'rgba(10,8,6,0.85)', backdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #ffc832, #ff6b00)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, animation: 'glow 3s ease-in-out infinite',
        }}>🐱</div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#ffc832', letterSpacing: '-0.5px' }}>
          CHONK9K
        </span>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActive(t)} style={{
            fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: active === t ? '#ffc832' : 'transparent',
            color: active === t ? '#0a0806' : 'rgba(255,255,255,0.45)',
            transition: 'all 0.2s',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {balance && balance > 0n && (
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#ffc832',
            background: 'rgba(255,200,50,0.08)', padding: '5px 12px',
            borderRadius: 6, border: '1px solid rgba(255,200,50,0.18)',
          }}>
            {fmt(balance)} CHONK
          </span>
        )}
        <WalletButton />
      </div>
    </nav>
  )
}

// ── Price fetcher (GeckoTerminal public API) ───────────────────────────────────
function useLivePrice() {
  const [price, setPrice] = useState(null)
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/base/pools/${POOL_ADDRESS}`,
          { headers: { Accept: 'application/json;version=20230302' } }
        )
        const json = await res.json()
        const attr = json?.data?.attributes
        if (attr) {
          setPrice({
            priceUsd: attr.base_token_price_usd,
            priceChange24h: attr.price_change_percentage?.h24 ?? 0,
            volume24h: attr.volume_usd?.h24 ?? 0,
            liquidity: attr.reserve_in_usd ?? 0,
          })
        }
      } catch (_) {}
    }
    fetch_()
    const id = setInterval(fetch_, 30_000)
    return () => clearInterval(id)
  }, [])
  return price
}

// ── Inner app (needs wagmi context) ───────────────────────────────────────────
function AppInner() {
  const [active, setActive] = useState('Dashboard')
  const price = useLivePrice()

  const tabMap = {
    Dashboard: <Dashboard price={price} />,
    Vesting: <Vesting />,
    Govern: <Govern />,
    Swap: <Swap />,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0806', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0806; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes float { from { transform: translateY(0) scale(1); opacity: .3; } to { transform: translateY(-28px) scale(1.2); opacity: .7; } }
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes glow  { 0%,100% { box-shadow: 0 0 18px rgba(255,200,50,.3); } 50% { box-shadow: 0 0 36px rgba(255,200,50,.6); } }
        @keyframes slideIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        a:hover { opacity: .8; }
      `}</style>
      <Particles />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Nav active={active} setActive={setActive} />
        <div style={{ animation: 'slideIn 0.35s ease' }}>
          {tabMap[active]}
        </div>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
