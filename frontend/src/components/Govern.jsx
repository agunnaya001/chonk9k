import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useVotes, useDelegates, useChonkBalance, fmt } from '../hooks/useChonk'
import { CHONK_ADDRESS, ERC20_ABI } from '../abis'

const Spinner = () => (
  <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
)

// Mock proposals — replace with on-chain Governor contract calls in v2
const INITIAL_PROPOSALS = [
  { id: 1, title: 'Increase yearly mint rate by 2%', desc: 'Proposal to update yearlyMintRate via updateMintRate(). Funds will go to LP incentives.', status: 'Active', forPct: 62, againstPct: 38, ends: '2d 4h', voted: null },
  { id: 2, title: 'Lock LP for 6 months', desc: 'Use lockPool() to lock the Uniswap V4 pool for 6 months, preventing rugpull risk.', status: 'Active', forPct: 81, againstPct: 19, ends: '5d 12h', voted: null },
  { id: 3, title: 'Add CHONK/USDC pool on Aerodrome', desc: 'Deploy additional liquidity on Aerodrome Finance to deepen CHONK9K liquidity on Base.', status: 'Passed', forPct: 74, againstPct: 26, ends: 'Ended', voted: true },
  { id: 4, title: 'Burn 1% of treasury quarterly', desc: 'Deflationary measure: owner calls burn() on 1% of treasury balance every quarter.', status: 'Failed', forPct: 44, againstPct: 56, ends: 'Ended', voted: null },
]

const statusColor = (s) => ({ Active: '#ffc832', Passed: '#4ade80', Failed: '#f87171' }[s] || '#fff')

export default function Govern() {
  const { address, isConnected } = useAccount()
  const [proposals, setProposals] = useState(INITIAL_PROPOSALS)

  const { data: votes } = useVotes()
  const { data: delegatee } = useDelegates()
  const { data: balance } = useChonkBalance()

  const isSelfDelegated = delegatee && address && delegatee.toLowerCase() === address.toLowerCase()
  const hasVotePower = votes && votes > 0n

  // ── Delegate ──────────────────────────────────────────────────────────────
  const { writeContract: doDelegate, data: delegateTx } = useWriteContract()
  const { isLoading: delegating, isSuccess: delegated } = useWaitForTransactionReceipt({ hash: delegateTx })

  const handleSelfDelegate = () => doDelegate({
    address: CHONK_ADDRESS, abi: ERC20_ABI,
    functionName: 'delegate',
    args: [address],
  })

  // ── Vote (mock — wire to Governor contract in v2) ─────────────────────────
  const castVote = (id, support) => {
    if (!isConnected) return
    setProposals(ps => ps.map(p => p.id !== id ? p : {
      ...p, voted: support,
      forPct: support ? Math.min(100, p.forPct + 4) : p.forPct,
      againstPct: !support ? Math.min(100, p.againstPct + 4) : p.againstPct,
    }))
  }

  return (
    <div style={{ padding: '40px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 42, color: '#fff', margin: '0 0 8px' }}>
            Govern <span style={{ color: '#ffc832' }}>CHONK</span>
          </h1>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            ERC-20Votes · on-chain · your stake = your voice
          </p>
        </div>

        {/* Vote power + delegate */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
            Your Vote Power
          </div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: '#ffc832', marginBottom: 12 }}>
            {isConnected ? fmt(votes) : '—'}
          </div>
          <button
            onClick={handleSelfDelegate}
            disabled={!isConnected || isSelfDelegated || delegating}
            style={{
              fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700,
              padding: '10px 18px', borderRadius: 10,
              border: `1px solid ${isSelfDelegated ? '#4ade80' : 'rgba(255,200,50,0.3)'}`,
              background: 'transparent',
              color: isSelfDelegated ? '#4ade80' : '#ffc832',
              cursor: isConnected && !isSelfDelegated ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
            {delegating ? <><Spinner /> Delegating…</> : isSelfDelegated ? '✓ Self-Delegated' : 'Activate Votes'}
          </button>
          {!isSelfDelegated && isConnected && (
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
              You must delegate to vote
            </div>
          )}
        </div>
      </div>

      {/* Vote power info banner */}
      {isConnected && !hasVotePower && balance && balance > 0n && (
        <div style={{
          background: 'rgba(255,200,50,0.06)', border: '1px solid rgba(255,200,50,0.2)',
          borderRadius: 12, padding: '14px 20px', marginBottom: 24,
          fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#ffc832',
        }}>
          ⚠ You hold {fmt(balance)} CHONK but have 0 vote power. Click "Activate Votes" above to self-delegate.
        </div>
      )}

      {/* Proposals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {proposals.map(p => (
          <div key={p.id} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,200,50,0.1)',
            borderRadius: 16, padding: 28,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ flex: 1, paddingRight: 20 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 6 }}>
                  {p.title}
                </div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 10, lineHeight: 1.7 }}>
                  {p.desc}
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: statusColor(p.status) }}>● {p.status}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{p.ends}</span>
                </div>
              </div>

              {/* Vote buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                {p.status === 'Active' && p.voted === null && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => castVote(p.id, true)} disabled={!isConnected || !hasVotePower} style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
                      padding: '8px 18px', borderRadius: 8, border: '1px solid #4ade80',
                      background: 'transparent', color: '#4ade80',
                      cursor: isConnected && hasVotePower ? 'pointer' : 'not-allowed',
                      opacity: isConnected && hasVotePower ? 1 : 0.4,
                    }}>For</button>
                    <button onClick={() => castVote(p.id, false)} disabled={!isConnected || !hasVotePower} style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
                      padding: '8px 18px', borderRadius: 8, border: '1px solid #f87171',
                      background: 'transparent', color: '#f87171',
                      cursor: isConnected && hasVotePower ? 'pointer' : 'not-allowed',
                      opacity: isConnected && hasVotePower ? 1 : 0.4,
                    }}>Against</button>
                  </div>
                )}
                {p.voted !== null && (
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: p.voted ? '#4ade80' : '#f87171' }}>
                    ✓ Voted {p.voted ? 'For' : 'Against'}
                  </span>
                )}
              </div>
            </div>

            {/* Vote bar */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#4ade80', width: 32 }}>{p.forPct}%</span>
              <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p.forPct}%`, background: 'linear-gradient(90deg, #4ade80, #22c55e)', borderRadius: 999, transition: 'width 0.5s' }} />
              </div>
              <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p.againstPct}%`, background: 'linear-gradient(90deg, #f87171, #ef4444)', borderRadius: 999, transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#f87171', width: 32, textAlign: 'right' }}>{p.againstPct}%</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
        Governor contract integration coming in v2 · Proposals currently illustrative
      </div>
    </div>
  )
}
