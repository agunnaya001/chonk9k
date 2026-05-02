export const CHONK_ADDRESS = import.meta.env.VITE_CHONK_ADDRESS ||
  '0x063d41475AfAf969c12df8933b99928e1B17E5cc'

export const STAKING_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS ||
  '0x0000000000000000000000000000000000000000'

export const POOL_ADDRESS = import.meta.env.VITE_POOL_ADDRESS ||
  '0x357a29f46bc3292fd9900b598acdd41c8f84674182205089927271a96d8459bb'

// ERC-20 ABI (minimal)
export const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }] },
  { name: 'totalSupply', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint8' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'string' }] },
  // Votes
  { name: 'delegate', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'delegatee', type: 'address' }], outputs: [] },
  { name: 'delegates', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'address' }] },
  { name: 'getVotes', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] },
  // Vesting
  { name: 'vestingStart', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'vestingDuration', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'computeAvailableVestedAmount', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] },
  { name: 'getVestingDataOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [
      { name: 'totalAmount', type: 'uint256' },
      { name: 'releasedAmount', type: 'uint256' },
    ] },
  { name: 'release', type: 'function', stateMutability: 'nonpayable',
    inputs: [], outputs: [] },
  // Inflation
  { name: 'yearlyMintRate', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'lastMintTimestamp', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'mintInflation', type: 'function', stateMutability: 'nonpayable',
    inputs: [], outputs: [] },
  // Pool
  { name: 'isPoolUnlocked', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'bool' }] },
]

// Staking ABI
export const STAKING_ABI = [
  { name: 'stake', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }, { name: 'lockDuration', type: 'uint256' }],
    outputs: [] },
  { name: 'unstake', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'claim', type: 'function', stateMutability: 'nonpayable',
    inputs: [], outputs: [] },
  { name: 'emergencyWithdraw', type: 'function', stateMutability: 'nonpayable',
    inputs: [], outputs: [] },
  { name: 'pendingRewards', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] },
  { name: 'stakeInfo', type: 'function', stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'rewardDebt', type: 'uint256' },
      { name: 'stakedAt', type: 'uint256' },
      { name: 'lockEnd', type: 'uint256' },
    ] },
  { name: 'tierOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] },
  { name: 'isLocked', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }] },
  { name: 'votePower', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }] },
  { name: 'totalStaked', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'rewardPerSecond', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'LOCK_30D', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'LOCK_90D', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'LOCK_180D', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  // Events
  { name: 'Staked', type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'lockDuration', type: 'uint256', indexed: false },
    ] },
  { name: 'Unstaked', type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ] },
  { name: 'RewardClaimed', type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ] },
]
