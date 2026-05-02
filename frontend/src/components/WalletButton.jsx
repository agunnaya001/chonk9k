import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { base } from 'wagmi/chains'
import { useState } from 'react'

const s = {
  btn: (active) => ({
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    fontWeight: 700,
    padding: '10px 20px',
    borderRadius: 10,
    border: `1px solid ${active ? '#ffc832' : 'rgba(255,200,50,0.35)'}`,
    background: active ? '#ffc832' : 'transparent',
    color: active ? '#0a0806' : '#ffc832',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: active ? '0 4px 12px rgba(255,200,50,0.15)' : 'none',
  }),
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.25s ease-out',
  },
  card: {
    background: 'rgba(17,16,9,0.95)', border: '1px solid rgba(255,200,50,0.25)',
    borderRadius: 24, padding: 36, minWidth: 360,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,50,0.1)',
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
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: '#fff', marginBottom: 10 }}>
              Connect Wallet
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>
              Select a wallet to connect to CHONK9K on Base
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {connectors.map(c => (
                <button key={c.uid} onClick={() => { connect({ connector: c }); setOpen(false) }} style={{
                  padding: '16px 20px', borderRadius: 14,
                  border: '1px solid rgba(255,200,50,0.2)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#fff', cursor: 'pointer',
                  fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 600,
                  textAlign: 'left', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 14,
                  hoverStyle: 'background: rgba(255,200,50,0.08);',
                }}>
                  <span style={{ fontSize: 22 }}>
                    {c.name === 'Coinbase Wallet' ? '🔵' : c.name === 'WalletConnect' ? '🔗' : '🦊'}
                  </span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setOpen(false)} style={{
              marginTop: 20, width: '100%', padding: '12px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)',
              fontFamily: "'Space Mono', monospace", fontSize: 13, cursor: 'pointer', borderRadius: 10,
              transition: 'all 0.2s',
            }}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}
