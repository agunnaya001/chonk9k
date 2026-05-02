import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { fmt, truncateAddress } from '../utils/formatting'

export function TransactionHistory() {
  const { address } = useAccount()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) return
    
    setLoading(true)
    fetch(`/api/transactions?address=${address}`)
      .then(r => r.json())
      .then(data => setTransactions(data.transactions || []))
      .catch(err => console.error('[TransactionHistory] Error:', err))
      .finally(() => setLoading(false))
  }, [address])

  if (!address) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 32,
        color: 'rgba(255,255,255,0.4)',
      }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
          Connect wallet to view transaction history
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 32,
        color: 'rgba(255,255,255,0.4)',
      }}>
        <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>↻</div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 32,
        color: 'rgba(255,255,255,0.4)',
      }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
          No transactions yet
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {transactions.map((tx, idx) => (
        <div key={tx.hash} style={{
          padding: '16px 0',
          borderBottom: idx < transactions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 4,
            }}>
              {tx.type} - {fmt(tx.amount)}
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
            }}>
              {truncateAddress(tx.hash)} · {new Date(tx.timestamp).toLocaleDateString()}
            </div>
          </div>
          <div style={{
            padding: '6px 12px',
            borderRadius: 8,
            background: tx.status === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(255,200,50,0.1)',
            border: tx.status === 'success' ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(255,200,50,0.25)',
            fontSize: 11,
            fontFamily: "'Space Mono', monospace",
            color: tx.status === 'success' ? '#4ade80' : '#ffc832',
            fontWeight: 600,
          }}>
            {tx.status === 'success' ? '✓ Success' : tx.status === 'pending' ? '⧖ Pending' : '✕ Failed'}
          </div>
        </div>
      ))}
    </div>
  )
}
