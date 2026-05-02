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
import { Analytics } from './components/Analytics'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import { useChonkBalance, fmt } from './hooks/useChonk'
import { CHONK_ADDRESS, POOL_ADDRESS } from './abis'

const queryClient = new QueryClient()

// ── Particles ────────────────────────────────────────────────────────────────
const Particles = () => {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 6 + 1.5, dur: Math.random() * 12 + 10, delay: Math.random() * 6,
    opacity: Math.random() * 0.4 + 0.15,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: `rgba(255,200,50,${p.opacity})`,
          boxShadow: `0 0 ${p.size * 2}px rgba(255,200,50,${p.opacity * 0.6})`,
          animation: `float ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
          filter: 'blur(0.5px)',
        }} />
      ))}
    </div>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────
const TABS = ['Dashboard', 'Vesting', 'Govern', 'Swap', 'Analytics']

function Nav({ active, setActive }) {
  const { data: balance } = useChonkBalance()
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 36px', borderBottom: '1px solid rgba(255,200,50,0.15)',
      background: 'rgba(10,8,6,0.92)', backdropFilter: 'blur(24px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #ffc832, #ff8800)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, animation: 'glow 3s ease-in-out infinite',
          boxShadow: '0 4px 20px rgba(255,200,50,0.25)',
        }}>🐱</div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: '#ffc832', letterSpacing: '-0.5px' }}>
          CHONK9K
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', padding: 6, borderRadius: 12 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActive(t)} style={{
            fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
            padding: '10px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: active === t ? '#ffc832' : 'transparent',
            color: active === t ? '#0a0806' : 'rgba(255,255,255,0.5)',
            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: active === t ? '0 4px 12px rgba(255,200,50,0.15)' : 'none',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {balance && balance > 0n && (
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#ffc832',
            background: 'rgba(255,200,50,0.1)', padding: '8px 14px',
            borderRadius: 8, border: '1px solid rgba(255,200,50,0.25)',
            transition: 'all 0.2s',
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
    Analytics: <Analytics />,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0806', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0806; font-family: 'Space Mono', monospace; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes float { from { transform: translateY(0) scale(1); opacity: .25; } to { transform: translateY(-32px) scale(1.15); opacity: .8; } }
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes glow  { 0%,100% { box-shadow: 0 0 20px rgba(255,200,50,.35), 0 0 60px rgba(255,200,50,.1); } 50% { box-shadow: 0 0 40px rgba(255,200,50,.55), 0 0 80px rgba(255,200,50,.2); } }
        @keyframes slideIn { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        button { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
        button:hover:not(:disabled) { transform: translateY(-1px); }
        a { transition: all 0.2s; }
        a:hover { opacity: 0.85; }
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
    <ErrorBoundary>
      <ToastProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <AppInner />
          </QueryClientProvider>
        </WagmiProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
