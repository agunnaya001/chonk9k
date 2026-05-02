import { formatUnits, formatEther } from 'viem'

const DECIMALS = 18

/**
 * Formats a bigint value to a human-readable string with appropriate suffix
 */
export const fmt = (val, dec = 2) => {
  if (!val && val !== 0n) return '—'
  const n = parseFloat(formatUnits(val, DECIMALS))
  if (n >= 1e12) return (n / 1e12).toFixed(dec) + 'T'
  if (n >= 1e9) return (n / 1e9).toFixed(dec) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(dec) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(dec) + 'K'
  return n.toFixed(dec)
}

/**
 * Format raw numbers (not bigint)
 */
export const fmtRaw = (n, dec = 2) => {
  if (!n && n !== 0) return '—'
  if (n >= 1e12) return (n / 1e12).toFixed(dec) + 'T'
  if (n >= 1e9) return (n / 1e9).toFixed(dec) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(dec) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(dec) + 'K'
  return n.toFixed(dec)
}

/**
 * Format as percentage
 */
export const fmtPercent = (value, decimal = 1) => {
  if (!value && value !== 0) return '—'
  return `${(Number(value) * 100).toFixed(decimal)}%`
}

/**
 * Format as USD with proper locale
 */
export const fmtUSD = (value, dec = 2) => {
  if (!value && value !== 0) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).format(Number(value))
}

/**
 * Truncate address for display
 */
export const truncateAddress = (addr) => {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

/**
 * Calculate APY from annual rate
 */
export const calcAPY = (dailyRate) => {
  if (!dailyRate || dailyRate === 0) return 0
  return ((1 + dailyRate) ** 365 - 1) * 100
}

/**
 * Format time remaining
 */
export const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return 'Complete'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

/**
 * Check if a value is within safe bounds
 */
export const isSafeValue = (value) => {
  return value && value >= 0n && value < BigInt(2 ** 256)
}
