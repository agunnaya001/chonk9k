import { useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits } from 'viem'
import { useVestingData, useChonkBalance, fmt } from '../hooks/useChonk'
import { CHONK_ADDRESS, ERC20_ABI } from '../abis'

const Spinner = () => (
  <div style={{
    width: 16, height: 16, border: '2px solid currentColor',
    borderTopColor: 'transparent', borderRadius: '50%',
    animation: 'spin 1s linear infinite', display: 'inline-block',
  }} />
)

const Row = ({ label, value, accent }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
  }}>
    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: accent || '#fff' }}>{value}</span>
  </div>
)

export default function Vesting() {
  const { address, isConnected } = useAccount()
  const { data: balance, refetch: refetchBalance } = useChonkBalance()
  const { data: vestingData, refetch: refetchVesting } = useVestingData()

  const claimable     = vestingData?.[0]?.result ?? 0n   // computeAvailableVestedAmount
  const vestingInfo   = vestingData?.[1]?.result         // [totalAmount, releasedAmount]
  const vestingStart  = vestingData?.[2]?.result         // timestamp
  const vestingDur    = vestingData?.[3]?.result         // seconds

  const totalVested   = vestingInfo?.[0] ?? 0n
  const released      = vestingInfo?.[1] ?? 0n
  const locked        = totalVested - released - claimable

  // Vesting progress %
  const progressPct = totalVested > 0n
    ? Math.min(100, Number((released + claimable) * 100n / totalVested))
    : 0

  // Time remaining
  const vestingEndTs = vestingStart && vestingDur
    ? Number(vestingStart) + Number(vestingDur)
    : null
  const now = Math.floor(Date.now() / 1000)
  const secondsLeft = vestingEndTs ? Math.max(0, vestingEndTs - now) : null
  const daysLeft = secondsLeft !== null ? Math.floor(secondsLeft / 86400) : null

  // Vesting end date
  const endDate = vestingEndTs
    ? new Date(vestingEndTs * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—'

  const hasVesting = totalVested > 0n
  const canClaim   = claimable > 0n

  // ── release() ─────────────────────────────────────────────────────────────
  const { writeContract: doRelease, data: releaseTx } = useWriteContract()
  const { isLoading: releasing, isSuccess: released_ } = useWaitForTransactionReceipt({ hash: releaseTx })

  useEffect(() => {
    if (released_) { refetchBalance(); refetchVesting() }
  }, [released_])

  const handleRelease = () => doRelease({
    address: CHONK_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'release',
    args: [],
  })

  const primaryBtn = (disabled) => ({
    width: '100%', padding: '16px', borderRadius: 12, border: 'none',
    background: !disabled ? '#ffc832' : 'rgba(255,255,255,0.08)',
    color: !disabled ? '#0a0806' : 'rgba(255,255,255,0.3)',
    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16,
    cursor: !disabled ? 'pointer' : 'not-allowed',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'all 0.2s',
  })

  return (
    <div style={{ padding: '40px 32px' }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 42, color: '#fff', margin: '0 0 8px' }}>
        Vesting <span style={{ color: '#ffc832' }}>Claim</span>
      </h1>
      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 40 }}>
        Your CHONK9K allocation unlocks linearly · claim anytime
      </p>

      {!isConnected ? (
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,200,50,0.12)',
          borderRadius: 20, padding: 48, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 8 }}>
            Connect your wallet
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            Connect to check if you have a vesting allocation
          </div>
        </div>
      ) : !hasVesting ? (
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 48, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🐱</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 8 }}>
            No vesting allocation found
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
            This address has no vested CHONK9K tokens.
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
            {address?.slice(0, 10)}…{address?.slice(-8)}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* ── Left: Progress + Claim ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Progress card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,200,50,0.15)',
              borderRadius: 20, padding: 32,
            }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 24 }}>
                Vesting Progress
              </div>

              {/* Big claimable number */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Available to Claim
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 48, color: '#ffc832', lineHeight: 1 }}>
                  {fmt(claimable)}
                </div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
                  CHONK9K
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Unlocked</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#ffc832' }}>{progressPct.toFixed(1)}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #ffc832, #ff6b00)',
                    borderRadius: 999, transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                    {fmt(released)} claimed
                  </span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                    {fmt(totalVested)} total
                  </span>
                </div>
              </div>
            </div>

            {/* Claim button card */}
            <div style={{
              background: canClaim ? 'rgba(255,200,50,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${canClaim ? 'rgba(255,200,50,0.25)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 20, padding: 28,
            }}>
              <button
                onClick={handleRelease}
                disabled={!canClaim || releasing}
                style={primaryBtn(!canClaim || releasing)}
              >
                {releasing
                  ? <><Spinner /> Claiming…</>
                  : canClaim
                  ? `Claim ${fmt(claimable)} CHONK9K`
                  : 'Nothing to claim yet'}
              </button>

              {released_ && (
                <div style={{ marginTop: 14, textAlign: 'center' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#4ade80' }}>✓ Claimed · </span>
                  <a href={`https://basescan.org/tx/${releaseTx}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#ffc832' }}>
                    View on Basescan ↗
                  </a>
                </div>
              )}

              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 14, textAlign: 'center', lineHeight: 1.7 }}>
                Tokens unlock linearly from vesting start.<br />
                Call release() at any time to collect what's unlocked.
              </div>
            </div>
          </div>

          {/* ── Right: Allocation details ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Allocation breakdown */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,200,50,0.12)',
              borderRadius: 20, padding: 28, flex: 1,
            }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 20 }}>
                Your Allocation
              </div>

              <Row label="Total Allocated" value={`${fmt(totalVested)} CHONK`} accent="#fff" />
              <Row label="Already Claimed" value={`${fmt(released)} CHONK`} />
              <Row label="Available Now" value={`${fmt(claimable)} CHONK`} accent="#ffc832" />
              <Row label="Still Locked" value={`${fmt(locked > 0n ? locked : 0n)} CHONK`} />
              <Row label="Wallet Balance" value={`${fmt(balance)} CHONK`} />
            </div>

            {/* Schedule */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: 28,
            }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 20 }}>
                Vesting Schedule
              </div>

              <Row
                label="Vesting Started"
                value={vestingStart
                  ? new Date(Number(vestingStart) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                  : '—'}
              />
              <Row label="Fully Unlocked" value={endDate} />
              <Row
                label="Duration"
                value={vestingDur
                  ? `${Math.floor(Number(vestingDur) / 86400)} days`
                  : '—'}
              />
              <Row
                label="Days Remaining"
                value={daysLeft !== null ? (daysLeft === 0 ? '✓ Complete' : `${daysLeft}d`) : '—'}
                accent={daysLeft === 0 ? '#4ade80' : '#fff'}
              />

              {daysLeft === 0 && (
                <div style={{
                  marginTop: 16, padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
                  fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#4ade80', textAlign: 'center',
                }}>
                  🎉 Fully vested — claim your remaining tokens!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
