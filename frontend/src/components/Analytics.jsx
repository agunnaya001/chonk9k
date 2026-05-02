import { useChonkBalance, useVotes, useStakeInfo, useInflationData, fmt, TIER_NAMES, TIER_COLORS } from '../hooks/useChonk'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export function Analytics() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useChonkBalance()
  const { data: votes } = useVotes()
  const { data: stakeInfo } = useStakeInfo()
  const { data: inflationData } = useInflationData()
  const [apy, setAPY] = useState(0)
  const [tvl, setTVL] = useState('—')

  // Calculate APY and TVL when data loads
  useEffect(() => {
    if (!stakeInfo?.length) return
    
    const [stakeData, pending, tier, isLocked, totalStaked, rewardPerSec] = stakeInfo.map(s => s.result)
    
    if (rewardPerSec && totalStaked && totalStaked > 0n) {
      const yearlyRewards = rewardPerSec * BigInt(365 * 24 * 60 * 60)
      const apy = (Number(yearlyRewards) / Number(totalStaked)) * 100
      setAPY(apy)
    }
    
    if (totalStaked) {
      setTVL(fmt(totalStaked, 0))
    }
  }, [stakeInfo])

  const StatBox = ({ label, value, unit = '', highlight = false }) => (
    <div style={{
      background: highlight ? 'rgba(255,200,50,0.08)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${highlight ? 'rgba(255,200,50,0.2)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 12,
      padding: 16,
      transition: 'all 0.3s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = highlight ? 'rgba(255,200,50,0.1)' : 'rgba(255,255,255,0.05)'
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = highlight ? 'rgba(255,200,50,0.08)' : 'rgba(255,255,255,0.03)'
      e.currentTarget.style.boxShadow = 'none'
    }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        color: 'rgba(255,255,255,0.45)',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 1,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 20,
        fontWeight: 700,
        color: highlight ? '#ffc832' : '#fff',
      }}>
        {value} <span style={{ fontSize: 14, fontWeight: 600 }}>{unit}</span>
      </div>
    </div>
  )

  if (!isConnected) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 40,
        color: 'rgba(255,255,255,0.4)',
      }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13 }}>
          Connect your wallet to view analytics
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 32px' }}>
      <h1 style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: 48,
        color: '#fff',
        margin: '0 0 12px',
        lineHeight: 1.1,
      }}>
        Your <span style={{ color: '#ffc832' }}>Analytics</span>
      </h1>
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 13,
        color: 'rgba(255,255,255,0.45)',
        marginBottom: 40,
      }}>
        Track your holdings, rewards, and governance power
      </p>

      {/* Personal Stats */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: 22,
          color: '#fff',
          marginBottom: 16,
        }}>
          Your Holdings
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <StatBox label="CHONK Balance" value={fmt(balance)} />
          <StatBox label="Voting Power" value={fmt(votes)} />
          {stakeInfo?.length && (
            <StatBox label="Tier" value={TIER_NAMES[stakeInfo[2]?.result || 0]} />
          )}
        </div>
      </div>

      {/* Protocol Stats */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: 22,
          color: '#fff',
          marginBottom: 16,
        }}>
          Protocol Metrics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
          <StatBox label="Total Staked (TVL)" value={tvl} highlight />
          <StatBox label="Staking APY" value={apy.toFixed(2)} unit="%" />
          {inflationData?.length && (
            <>
              <StatBox label="Total Supply" value={fmt(inflationData[3]?.result)} />
              <StatBox label="Pool Status" value={inflationData[2]?.result ? '🟢 Unlocked' : '🔴 Locked'} />
            </>
          )}
        </div>
      </div>

      {/* Staking Details */}
      {stakeInfo?.length && stakeInfo[0]?.result && (
        <div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: '#fff',
            marginBottom: 16,
          }}>
            Staking Details
          </h2>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: 24,
          }}>
            {[
              ['Amount Staked', fmt(stakeInfo[0]?.result?.amount)],
              ['Pending Rewards', fmt(stakeInfo[1]?.result)],
              ['Stake Locked Until', stakeInfo[0]?.result?.unlockTime ? new Date(Number(stakeInfo[0]?.result?.unlockTime) * 1000).toLocaleDateString() : '—'],
            ].map(([label, value]) => (
              <div key={label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: 12,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 12,
              }}>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.45)',
                }}>
                  {label}
                </span>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12,
                  color: '#fff',
                  fontWeight: 600,
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
