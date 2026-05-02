import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import { CHONK_ADDRESS, STAKING_ADDRESS, ERC20_ABI, STAKING_ABI } from '../abis'

const DECIMALS = 18

export const fmt = (val, dec = 2) => {
  if (!val && val !== 0n) return '—'
  const n = parseFloat(formatUnits(val, DECIMALS))
  if (n >= 1e12) return (n / 1e12).toFixed(dec) + 'T'
  if (n >= 1e9)  return (n / 1e9).toFixed(dec) + 'B'
  if (n >= 1e6)  return (n / 1e6).toFixed(dec) + 'M'
  if (n >= 1e3)  return (n / 1e3).toFixed(dec) + 'K'
  return n.toFixed(dec)
}

export const fmtRaw = (n, dec = 2) => {
  if (!n && n !== 0) return '—'
  if (n >= 1e12) return (n / 1e12).toFixed(dec) + 'T'
  if (n >= 1e9)  return (n / 1e9).toFixed(dec) + 'B'
  if (n >= 1e6)  return (n / 1e6).toFixed(dec) + 'M'
  if (n >= 1e3)  return (n / 1e3).toFixed(dec) + 'K'
  return n.toFixed(dec)
}

// ── Token reads ──────────────────────────────────────────────────────────────

export function useChonkBalance() {
  const { address } = useAccount()
  return useReadContract({
    address: CHONK_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10_000 },
  })
}

export function useChonkAllowance() {
  const { address } = useAccount()
  return useReadContract({
    address: CHONK_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address, STAKING_ADDRESS],
    query: { enabled: !!address, refetchInterval: 10_000 },
  })
}

export function useVotes() {
  const { address } = useAccount()
  return useReadContract({
    address: CHONK_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'getVotes',
    args: [address],
    query: { enabled: !!address, refetchInterval: 15_000 },
  })
}

export function useDelegates() {
  const { address } = useAccount()
  return useReadContract({
    address: CHONK_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'delegates',
    args: [address],
    query: { enabled: !!address },
  })
}

export function useVestingData() {
  const { address } = useAccount()
  return useReadContracts({
    contracts: [
      { address: CHONK_ADDRESS, abi: ERC20_ABI, functionName: 'computeAvailableVestedAmount', args: [address] },
      { address: CHONK_ADDRESS, abi: ERC20_ABI, functionName: 'getVestingDataOf', args: [address] },
      { address: CHONK_ADDRESS, abi: ERC20_ABI, functionName: 'vestingStart' },
      { address: CHONK_ADDRESS, abi: ERC20_ABI, functionName: 'vestingDuration' },
    ],
    query: { enabled: !!address, refetchInterval: 15_000 },
  })
}

export function useInflationData() {
  return useReadContracts({
    contracts: [
      { address: CHONK_ADDRESS, abi: ERC20_ABI, functionName: 'yearlyMintRate' },
      { address: CHONK_ADDRESS, abi: ERC20_ABI, functionName: 'lastMintTimestamp' },
      { address: CHONK_ADDRESS, abi: ERC20_ABI, functionName: 'isPoolUnlocked' },
      { address: CHONK_ADDRESS, abi: ERC20_ABI, functionName: 'totalSupply' },
    ],
    refetchInterval: 30_000,
  })
}

// ── Staking reads ────────────────────────────────────────────────────────────

export function useStakeInfo() {
  const { address } = useAccount()
  return useReadContracts({
    contracts: [
      { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'stakeInfo', args: [address] },
      { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'pendingRewards', args: [address] },
      { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'tierOf', args: [address] },
      { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'isLocked', args: [address] },
      { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'totalStaked' },
      { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'rewardPerSecond' },
    ],
    query: { enabled: !!address, refetchInterval: 8_000 },
  })
}

export const TIER_NAMES = ['—', '🐱 Chonker', '🐋 Whale', '💎 MegaChonk']
export const TIER_COLORS = ['rgba(255,255,255,0.3)', '#ffc832', '#60a5fa', '#a855f7']
