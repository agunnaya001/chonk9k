import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { useChonkBalance, useInflationData, fmt } from '../hooks/useChonk'
import { CHONK_ADDRESS } from '../abis'

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,200,50,0.15)',
    borderRadius: 18, padding: '28px 32px',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'default',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
    e.currentTarget.style.borderColor = 'rgba(255,200,50,0.25)';
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,200,50,0.1)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
    e.currentTarget.style.borderColor = 'rgba(255,200,50,0.15)';
    e.currentTarget.style.boxShadow = 'none';
  }}>
    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600 }}>{label}</div>
    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: accent || '#fff', marginBottom: 6, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{sub}</div>}
  </div>
)

export default function Dashboard({ price }) {
  const { address, isConnected } = useAccount()
  const { data: balance } = useChonkBalance()
  const { data: inflation } = useInflationData()

  const totalSupply = inflation?.[3]?.result
  const mintRate    = inflation?.[0]?.result
  const lastMint    = inflation?.[1]?.result
  const poolUnlocked = inflation?.[2]?.result

  const balanceNum = balance ? parseFloat(formatUnits(balance, 18)) : 0
  const tier1Threshold = 1_000_000_000
  const tierUnlocked = balanceNum >= tier1Threshold

  // Next mint in: 1 year from lastMint
  const nextMintTs = lastMint ? Number(lastMint) + 365 * 24 * 3600 : null
  const now = Date.now() / 1000
  const secondsToMint = nextMintTs ? Math.max(0, nextMintTs - now) : null
  const daysToMint = secondsToMint !== null ? Math.floor(secondsToMint / 86400) : null

  return (
    <div style={{ padding: '48px 36px' }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 48, color: '#fff', margin: 0, lineHeight: 1.1 }}>
          Chonkpump <span style={{ color: '#ffc832' }}>Universe</span>
        </h1>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 12, letterSpacing: 0.5 }}>
          Live on Base Network ·{' '}
          <a href={`https://basescan.org/token/${CHONK_ADDRESS}`} target="_blank" rel="noopener noreferrer"
            style={{ color: '#ffc832', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s' }}>
            {CHONK_ADDRESS.slice(0, 6)}…{CHONK_ADDRESS.slice(-4)} ↗
          </a>
        </p>
      </div>

      {/* Price stats from GeckoTerminal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Price" value={price ? `$${parseFloat(price.priceUsd).toExponential(2)}` : '…'} sub={price ? `${parseFloat(price.priceChange24h) > 0 ? '+' : ''}${parseFloat(price.priceChange24h).toFixed(1)}% 24h` : ''} accent="#ffc832" />
        <StatCard label="24h Volume" value={price ? `$${parseFloat(price.volume24h) > 1e6 ? (parseFloat(price.volume24h)/1e6).toFixed(2)+'M' : parseFloat(price.volume24h).toFixed(0)}` : '…'} sub="Uniswap V4" />
        <StatCard label="Liquidity" value={price ? `$${parseFloat(price.liquidity) > 1e3 ? (parseFloat(price.liquidity)/1e3).toFixed(1)+'K' : price.liquidity}` : '…'} sub="Pool TVL" />
        <StatCard label="Total Supply" value={totalSupply ? fmt(totalSupply) : '100Q'} sub="CHONK9K" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Token gate */}
        <div style={{
          background: tierUnlocked ? 'linear-gradient(135deg, rgba(255,200,50,0.12), rgba(255,200,50,0.06))' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${tierUnlocked ? 'rgba(255,200,50,0.35)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 18, padding: 32,
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = tierUnlocked ? '0 8px 28px rgba(255,200,50,0.12)' : '0 8px 24px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 12 }}>
            {!isConnected ? '🔒 Connect to Check Tier' : tierUnlocked ? '🔓 Chonk Tier Unlocked' : '🔒 Chonk Tier Locked'}
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 18, lineHeight: 1.6 }}>
            Hold 1B+ CHONK9K for whale alerts, advanced analytics, and boosted governance weight.
          </div>
          {isConnected && (
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: tierUnlocked ? '#ffc832' : 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
              {tierUnlocked
                ? `✓ ${fmt(balance)} CHONK held`
                : `Your balance: ${fmt(balance)} CHONK`}
            </div>
          )}
        </div>

        {/* Contract stats */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 18, padding: 32,
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 20 }}>Contract Stats</div>
          {[
            ['Symbol', 'CHONK9K'],
            ['Chain', 'Base (L2)'],
            ['Standard', 'ERC-20 + Votes + Permit'],
            ['Pool Status', poolUnlocked === undefined ? '…' : poolUnlocked ? '🟢 Unlocked' : '🔴 Locked'],
            ['Next Mint', daysToMint !== null ? `${daysToMint}d` : '…'],
            ['Yearly Mint Rate', mintRate ? `${fmt(mintRate)} CHONK/yr` : '…'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{k}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#fff', fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
