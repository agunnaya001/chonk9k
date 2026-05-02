import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits, maxUint256 } from 'viem'
import { useChonkBalance, useChonkAllowance, useStakeInfo, fmt, TIER_NAMES, TIER_COLORS } from '../hooks/useChonk'
import { CHONK_ADDRESS, STAKING_ADDRESS, ERC20_ABI, STAKING_ABI } from '../abis'

const LOCK_OPTIONS = [
  { label: 'Flexible', value: 0, bonus: 0 },
  { label: '30 Days', value: 30 * 24 * 3600, bonus: 5 },
  { label: '90 Days', value: 90 * 24 * 3600, bonus: 15 },
  { label: '180 Days', value: 180 * 24 * 3600, bonus: 30 },
]

const Spinner = () => (
  <div style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
)

export default function Stake() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState('')
  const [lockIdx, setLockIdx] = useState(0)
  const [unstakeAmount, setUnstakeAmount] = useState('')

  const { data: balance, refetch: refetchBalance } = useChonkBalance()
  const { data: allowance, refetch: refetchAllowance } = useChonkAllowance()
  const { data: stakeData, refetch: refetchStake } = useStakeInfo()

  const stakedAmount   = stakeData?.[0]?.result?.[0] ?? 0n
  const pendingRewards = stakeData?.[1]?.result ?? 0n
  const tier           = Number(stakeData?.[2]?.result ?? 0)
  const locked         = stakeData?.[3]?.result ?? false
  const totalStaked    = stakeData?.[4]?.result ?? 0n
  const rewardPerSec   = stakeData?.[5]?.result ?? 0n

  // Estimate APY: (rewardPerSec * 31536000) / totalStaked * 100
  const apy = totalStaked > 0n
    ? (Number(formatUnits(rewardPerSec, 18)) * 31_536_000 / Number(formatUnits(totalStaked, 18)) * 100).toFixed(1)
    : '—'

  const needsApproval = allowance !== undefined && amount
    ? allowance < parseUnits(amount || '0', 18)
    : false

  // ── Approve ──────────────────────────────────────────────────────────────
  const { writeContract: approve, data: approveTx } = useWriteContract()
  const { isLoading: approving, isSuccess: approved } = useWaitForTransactionReceipt({ hash: approveTx })
  useEffect(() => { if (approved) refetchAllowance() }, [approved])

  // ── Stake ─────────────────────────────────────────────────────────────────
  const { writeContract: doStake, data: stakeTx } = useWriteContract()
  const { isLoading: staking, isSuccess: staked } = useWaitForTransactionReceipt({ hash: stakeTx })
  useEffect(() => { if (staked) { refetchBalance(); refetchStake(); setAmount('') } }, [staked])

  // ── Unstake ───────────────────────────────────────────────────────────────
  const { writeContract: doUnstake, data: unstakeTx } = useWriteContract()
  const { isLoading: unstaking, isSuccess: unstaked } = useWaitForTransactionReceipt({ hash: unstakeTx })
  useEffect(() => { if (unstaked) { refetchBalance(); refetchStake(); setUnstakeAmount('') } }, [unstaked])

  // ── Claim ─────────────────────────────────────────────────────────────────
  const { writeContract: doClaim, data: claimTx } = useWriteContract()
  const { isLoading: claiming, isSuccess: claimed } = useWaitForTransactionReceipt({ hash: claimTx })
  useEffect(() => { if (claimed) refetchStake() }, [claimed])

  const handleApprove = () => approve({
    address: CHONK_ADDRESS, abi: ERC20_ABI,
    functionName: 'approve',
    args: [STAKING_ADDRESS, maxUint256],
  })

  const handleStake = () => doStake({
    address: STAKING_ADDRESS, abi: STAKING_ABI,
    functionName: 'stake',
    args: [parseUnits(amount, 18), BigInt(LOCK_OPTIONS[lockIdx].value)],
  })

  const handleUnstake = () => doUnstake({
    address: STAKING_ADDRESS, abi: STAKING_ABI,
    functionName: 'unstake',
    args: [parseUnits(unstakeAmount || '0', 18)],
  })

  const handleClaim = () => doClaim({
    address: STAKING_ADDRESS, abi: STAKING_ABI,
    functionName: 'claim',
    args: [],
  })

  const inputStyle = {
    flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,200,50,0.2)',
    borderRadius: 10, padding: '14px 16px',
    fontFamily: "'Space Mono', monospace", fontSize: 15, color: '#fff', outline: 'none',
  }

  const primaryBtn = (disabled) => ({
    width: '100%', padding: 16, borderRadius: 12, border: 'none',
    background: !disabled ? '#ffc832' : 'rgba(255,255,255,0.08)',
    color: !disabled ? '#0a0806' : 'rgba(255,255,255,0.3)',
    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15,
    cursor: !disabled ? 'pointer' : 'not-allowed',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'all 0.2s',
  })

  const txLink = (hash) => hash
    ? <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer"
        style={{ color: '#ffc832', fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
        View on Basescan ↗
      </a>
    : null

  return (
    <div style={{ padding: '40px 32px' }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 42, color: '#fff', margin: '0 0 8px' }}>
        Stake <span style={{ color: '#ffc832' }}>CHONK</span>
      </h1>
      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 40 }}>
        Lock tokens · earn yield · power governance
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ── Stake Panel ── */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,200,50,0.15)', borderRadius: 20, padding: 32 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 24 }}>Stake Tokens</div>

          {/* Amount input */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>AMOUNT</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0" style={inputStyle} />
              <button onClick={() => setAmount(balance ? formatUnits(balance, 18) : '0')} style={{
                fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700,
                padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,200,50,0.3)',
                background: 'transparent', color: '#ffc832', cursor: 'pointer',
              }}>MAX</button>
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
              Balance: {fmt(balance)} CHONK
            </div>
          </div>

          {/* Lock options */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>LOCK PERIOD</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {LOCK_OPTIONS.map((opt, i) => (
                <button key={i} onClick={() => setLockIdx(i)} style={{
                  padding: '10px 6px', borderRadius: 10, border: `1px solid ${lockIdx === i ? '#ffc832' : 'rgba(255,255,255,0.1)'}`,
                  background: lockIdx === i ? 'rgba(255,200,50,0.1)' : 'transparent',
                  color: lockIdx === i ? '#ffc832' : 'rgba(255,255,255,0.5)',
                  fontFamily: "'Space Mono', monospace", fontSize: 10, cursor: 'pointer',
                  textAlign: 'center', lineHeight: 1.6,
                }}>
                  <div style={{ fontWeight: 700 }}>{opt.label}</div>
                  {opt.bonus > 0 && <div style={{ color: '#4ade80' }}>+{opt.bonus}%</div>}
                </button>
              ))}
            </div>
          </div>

          {/* APY banner */}
          <div style={{ background: 'rgba(255,200,50,0.06)', borderRadius: 10, padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>BASE APY</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: '#ffc832' }}>{apy}%</div>
            </div>
            {LOCK_OPTIONS[lockIdx].bonus > 0 && (
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>LOCK BONUS</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: '#4ade80' }}>+{LOCK_OPTIONS[lockIdx].bonus}%</div>
              </div>
            )}
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>TOTAL STAKED</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: '#fff' }}>{fmt(totalStaked)}</div>
            </div>
          </div>

          {/* CTA: Approve or Stake */}
          {needsApproval ? (
            <button onClick={handleApprove} disabled={!isConnected || approving}
              style={primaryBtn(isConnected && !approving ? false : true)}>
              {approving ? <><Spinner /> Approving…</> : 'Approve CHONK9K'}
            </button>
          ) : (
            <button onClick={handleStake} disabled={!isConnected || !amount || staking}
              style={primaryBtn(!isConnected || !amount || staking)}>
              {staking ? <><Spinner /> Staking…</> : 'Stake CHONK9K'}
            </button>
          )}

          {(staked || approved) && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#4ade80' }}>
                ✓ {approved ? 'Approved' : 'Staked'} · </span>
              {txLink(approved ? approveTx : stakeTx)}
            </div>
          )}
        </div>

        {/* ── Position Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Position card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,200,50,0.15)', borderRadius: 20, padding: 28, flex: 1 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 20 }}>Your Position</div>
            {[
              ['Staked', `${fmt(stakedAmount)} CHONK`],
              ['Pending Rewards', `${fmt(pendingRewards)} CHONK`],
              ['Tier', <span style={{ color: TIER_COLORS[tier] }}>{TIER_NAMES[tier]}</span>],
              ['Lock Status', locked ? '🔒 Locked' : stakedAmount > 0n ? '🔓 Unlocked' : '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{k}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#fff' }}>{v}</span>
              </div>
            ))}

            {/* Claim */}
            <button onClick={handleClaim} disabled={!isConnected || pendingRewards === 0n || claiming}
              style={{ ...primaryBtn(!isConnected || pendingRewards === 0n || claiming), background: 'transparent', border: '1px solid rgba(255,200,50,0.3)', color: pendingRewards > 0n ? '#ffc832' : 'rgba(255,255,255,0.2)', marginTop: 4 }}>
              {claiming ? <><Spinner /> Claiming…</> : `Claim ${fmt(pendingRewards)} CHONK`}
            </button>
            {claimed && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#4ade80', textAlign: 'center', marginTop: 8 }}>✓ Claimed · {txLink(claimTx)}</div>}
          </div>

          {/* Unstake */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 14 }}>Unstake</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input type="number" value={unstakeAmount} onChange={e => setUnstakeAmount(e.target.value)}
                placeholder="0" style={{ ...inputStyle, fontSize: 13 }} />
              <button onClick={() => setUnstakeAmount(formatUnits(stakedAmount, 18))} style={{
                fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700,
                padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              }}>MAX</button>
            </div>
            {locked && (
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#f87171', marginBottom: 10 }}>
                ⚠ Tokens are locked · wait for lock period to end
              </div>
            )}
            <button onClick={handleUnstake} disabled={!isConnected || !unstakeAmount || locked || unstaking}
              style={primaryBtn(!isConnected || !unstakeAmount || locked || unstaking)}>
              {unstaking ? <><Spinner /> Unstaking…</> : 'Unstake'}
            </button>
            {unstaked && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#4ade80', textAlign: 'center', marginTop: 8 }}>✓ Unstaked · {txLink(unstakeTx)}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
