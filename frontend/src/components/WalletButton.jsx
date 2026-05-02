import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { base } from 'wagmi/chains'
import { useState } from 'react'

const s = {
  btn: (active) => ({
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    fontWeight: 700,
    padding: '9px 18px',
    borderRadius: 8,
    border: `1px solid ${active ? '#ffc832' : 'rgba(255,200,50,0.3)'}`,
    background: active ? '#ffc832' : 'transparent',
    color: active ? '#0a0806' : '#ffc832',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
  },
  card: {
    background: '#111009', border: '1px solid rgba(255,200,50,0.2)',
    borderRadius: 20, padding: 32, minWidth: 340,
  },
}

export default function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [open, setOpen] = useState(false)

  const wrongChain = isConnected && chainId !== base.id

  if (isConnected) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {wrongChain && (
          <button onClick={() => switchChain({ chainId: base.id })} style={{
            ...s.btn(false), borderColor: '#f87171', color: '#f87171',
          }}>
            Switch to Base
          </button>
        )}
        <button onClick={() => disconnect()} style={s.btn(false)}>
          {address.slice(0, 6)}…{address.slice(-4)}
        </button>
      </div>
    )
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={s.btn(true)}>
        Connect Wallet
      </button>

      {open && (
        <div style={s.modal} onClick={() => setOpen(false)}>
          <div style={s.card} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 8 }}>
              Connect Wallet
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
              Select a wallet to connect to CHONK9K on Base
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {connectors.map(c => (
                <button key={c.uid} onClick={() => { connect({ connector: c }); setOpen(false) }} style={{
                  padding: '14px 18px', borderRadius: 12,
                  border: '1px solid rgba(255,200,50,0.15)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff', cursor: 'pointer',
                  fontFamily: "'Space Mono', monospace", fontSize: 13,
                  textAlign: 'left', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <span style={{ fontSize: 20 }}>
                    {c.name === 'Coinbase Wallet' ? '🔵' : c.name === 'WalletConnect' ? '🔗' : '🦊'}
                  </span>
                  {c.name}
                </button>
              ))}
            </div>
            <button onClick={() => setOpen(false)} style={{
              marginTop: 16, width: '100%', padding: '10px',
              background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)',
              fontFamily: "'Space Mono', monospace", fontSize: 12, cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </div>
      )}
    </>
  )
}
