import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useChonkBalance, useInflationData, fmt } from '../hooks/useChonk'
import { CHONK_ADDRESS, POOL_ADDRESS } from '../abis'

export default function Swap() {
  const { isConnected } = useAccount()
  const { data: balance } = useChonkBalance()
  const { data: inflationData } = useInflationData()
  const [tab, setTab] = useState('widget') // 'widget' | 'info'

  const poolUnlocked = inflationData?.[2]?.result  // isPoolUnlocked()
  const poolKnown = poolUnlocked !== undefined

  const dextoolsUrl = `https://www.dextools.io/widget-chart/en/base/pe-light/${POOL_ADDRESS}?theme=dark&chartType=1&chartResolution=30&drawingToolbars=false&showTradeHistory=true&chartInUsd=true&headerColor=0a0806&tvPlatformColor=0a0806&tvPaneColor=111009&tradeHistoryColor=111009`

  const uniswapUrl = `https://app.uniswap.org/swap?chain=base&outputCurrency=${CHONK_ADDRESS}`

  return (
    <div style={{ padding: '48px 36px' }}>

      {/* Pool lock status banner */}
      {poolKnown && !poolUnlocked && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(248,113,113,0.1), rgba(248,113,113,0.05))',
          border: '1px solid rgba(248,113,113,0.35)',
          borderRadius: 14, padding: '16px 22px', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 14,
          animation: 'slideIn 0.4s ease-out',
        }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#f87171', marginBottom: 2 }}>
              Pool is currently locked
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(248,113,113,0.75)' }}>
              Trading is paused by the contract owner. Swaps will fail until the pool is unlocked.
            </div>
          </div>
        </div>
      )}

      {poolKnown && poolUnlocked && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(74,222,128,0.08), rgba(74,222,128,0.04))',
          border: '1px solid rgba(74,222,128,0.25)',
          borderRadius: 14, padding: '14px 22px', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'slideIn 0.4s ease-out',
        }}>
          <span style={{ fontSize: 18 }}>🟢</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#4ade80', fontWeight: 600 }}>
            Pool is open · trading live on Uniswap V4
          </span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 48, color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>
            Swap <span style={{ color: '#ffc832' }}>CHONK</span>
          </h1>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5 }}>
            Uniswap V4 · Base Network
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.05)', padding: 6, borderRadius: 12 }}>
          {['widget', 'info'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
              padding: '10px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t ? '#ffc832' : 'transparent',
              color: tab === t ? '#0a0806' : 'rgba(255,255,255,0.5)',
              textTransform: 'capitalize', transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: tab === t ? '0 4px 12px rgba(255,200,50,0.15)' : 'none',
            }}>{t === 'widget' ? 'Chart' : 'Token Info'}</button>
          ))}
        </div>
      </div>

      {tab === 'widget' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28 }}>
          {/* DEXTools chart */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,200,50,0.15)', borderRadius: 18, overflow: 'hidden', minHeight: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <iframe
              title="CHONK9K Chart"
              src={dextoolsUrl}
              style={{ width: '100%', height: 480, border: 'none' }}
              allow="clipboard-write"
            />
          </div>

          {/* Uniswap swap widget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,200,50,0.15)', borderRadius: 18, overflow: 'hidden', flex: 1, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              <iframe
                title="Uniswap Swap"
                src={`https://app.uniswap.org/#/swap?chain=base&outputCurrency=${CHONK_ADDRESS}&theme=dark`}
                style={{ width: '100%', height: 400, border: 'none' }}
                allow="clipboard-write"
              />
            </div>

            {/* Quick links */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Quick Links</div>
              {[
                ['Uniswap', uniswapUrl, '↗'],
                ['DEXTools', `https://www.dextools.io/app/base/pair-explorer/${POOL_ADDRESS}`, '↗'],
                ['GeckoTerminal', `https://www.geckoterminal.com/base/pools/${POOL_ADDRESS}`, '↗'],
                ['Basescan', `https://basescan.org/token/${CHONK_ADDRESS}`, '↗'],
              ].map(([label, url, icon]) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  textDecoration: 'none',
                  fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.6)',
                  transition: 'color 0.15s',
                }}>
                  <span>{label}</span>
                  <span style={{ color: '#ffc832' }}>{icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'info' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Token details */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,200,50,0.15)', borderRadius: 18, padding: 32, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,200,50,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 24 }}>Token Details</div>
            {[
              ['Name', 'chonkpump'],
              ['Symbol', 'CHONK9K'],
              ['Chain', 'Base (8453)'],
              ['Decimals', '18'],
              ['Standard', 'ERC-20 + Votes + Permit'],
              ['Contract', `${CHONK_ADDRESS.slice(0,10)}…${CHONK_ADDRESS.slice(-8)}`],
              ['Pool', `${POOL_ADDRESS.slice(0,10)}…${POOL_ADDRESS.slice(-8)}`],
              ['Token URI', 'IPFS (on-chain metadata)'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{k}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#fff', maxWidth: 200, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* How to buy */}
          <div style={{ background: 'rgba(255,200,50,0.06)', border: '1px solid rgba(255,200,50,0.2)', borderRadius: 18, padding: 32, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,200,50,0.08)';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,200,50,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,200,50,0.06)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 24 }}>How to Buy</div>
            {[
              ['1', 'Install MetaMask or Coinbase Wallet'],
              ['2', 'Add Base Network (Chain ID: 8453)'],
              ['3', 'Bridge ETH to Base via bridge.base.org'],
              ['4', 'Connect wallet and swap ETH → CHONK9K'],
              ['5', 'Stake CHONK9K to earn rewards'],
              ['6', 'Activate votes to participate in governance'],
            ].map(([num, step]) => (
              <div key={num} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
                <div style={{
                  minWidth: 26, height: 26, borderRadius: '50%', background: 'rgba(255,200,50,0.15)',
                  border: '1px solid rgba(255,200,50,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#ffc832', fontWeight: 700,
                }}>{num}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, paddingTop: 3 }}>{step}</div>
              </div>
            ))}

            <a href={uniswapUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', marginTop: 8, padding: '14px', borderRadius: 12,
              background: '#ffc832', color: '#0a0806', textAlign: 'center',
              fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15,
              textDecoration: 'none', transition: 'opacity 0.2s',
            }}>
              Buy CHONK9K on Uniswap ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
