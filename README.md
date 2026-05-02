# CHONK9K - Advanced DeFi Protocol on Base

<div align="center">

[![Solidity](https://img.shields.io/badge/language-Solidity-363636?style=flat&logo=solidity)](https://soliditylang.org)
[![React](https://img.shields.io/badge/frontend-React%2018-61dafb?style=flat&logo=react)](https://react.dev)
[![Viem](https://img.shields.io/badge/library-Viem%202-645AFF?style=flat&logo=ethereum)](https://viem.sh)
[![Wagmi](https://img.shields.io/badge/hooks-Wagmi%202-ffffff?style=flat)](https://wagmi.sh)
[![Base](https://img.shields.io/badge/blockchain-Base%20L2-0052FF?style=flat&logo=ethereum)](https://base.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

## Overview

CHONK9K is a production-ready DeFi protocol built on Base featuring advanced tokenomics, staking mechanisms, on-chain governance, vesting schedules, and decentralized swaps. The protocol implements ERC-20 tokens with voting rights, configurable inflation, time-locked staking pools, and Uniswap V4 integration.

**Key Features:**
- ERC-20 token with voting rights (ERC-20Votes)
- Yearly configurable inflation mechanism
- Tiered staking pool with rewards
- Linear vesting with claim-anytime mechanics
- On-chain governance via voting delegation
- Uniswap V4 integration for DEX swaps
- Premium dark-themed React dashboard with real-time data
- Professional UI with gold accents and smooth animations

---

## Architecture

### Smart Contracts (Foundry)

Located in `/contracts/src/`:

#### `Chonk9kStaking.sol`
- Time-locked staking deposits
- Tier-based rewards (Chonker, Whale, MegaChonk)
- Pending rewards calculation with configurable APY
- Withdrawals with optional lock penalties

#### Token Features
- ERC-20 standard compliance
- ERC-20Votes for governance delegation
- Permit functionality (ERC-2612) for gasless approvals
- Yearly mint mechanism
- Linear vesting schedule
- Pool unlock mechanism for trading restrictions

### Frontend (React + Vite)

Located in `/frontend/src/`:

#### Core Components
- **Dashboard**: Token metrics, price data, contract stats
- **Vesting**: Claim vested tokens with progress tracking
- **Govern**: On-chain governance voting interface
- **Swap**: Uniswap V4 trading with DEXTools charts
- **Analytics**: Holdings, APY, tier tracking, protocol metrics

#### Utilities
- **Formatting**: Number formatting, currency conversion, address truncation
- **Performance**: Caching, memoization, throttling, Web Vitals

#### Hooks
- `useChonkBalance()`: User token balance
- `useVotes()`: Voting power
- `useVestingData()`: Vesting progress
- `useStakeInfo()`: Staking position and rewards
- `useInflationData()`: Supply, mint rate, pool status

#### Features
- Error boundary with recovery UI
- Toast notifications (success/error/info)
- Dark theme with gold accents
- Responsive design (mobile-first)
- Real-time contract data integration

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Base Sepolia testnet ETH

### Installation

```bash
# Clone repository
git clone <repo-url>
cd chonk9k

# Install dependencies
cd frontend && pnpm install
cd ../contracts && forge install
```

### Development

```bash
# Frontend
cd frontend
pnpm dev
# Opens http://localhost:5173

# Contracts
cd contracts
forge build
forge test
```

### Deployment

```bash
# Smart Contracts
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Frontend (Vercel)
pnpm run build
vercel --prod
```

---

## Smart Contract API

### Token (CHONK9K)

```solidity
// View Functions
function balanceOf(address account) external view returns (uint256);
function getVotes(address account) external view returns (uint256);

// Vesting
function computeAvailableVestedAmount(address account) external view returns (uint256);
function release() external returns (uint256);

// Inflation
function yearlyMintRate() external view returns (uint256);
function mint() external;
```

### Staking

```solidity
// Actions
function stake(uint256 amount, uint256 lockTime) external;
function unstake() external;
function harvestRewards() external returns (uint256);

// Views
function pendingRewards(address user) external view returns (uint256);
function tierOf(address user) external view returns (uint8);
```

---

## Configuration

### Environment Variables

Create `.env.local` in `/frontend`:

```bash
VITE_RPC_URL=https://base-rpc.publicnode.com
VITE_CHONK_ADDRESS=0x...
VITE_STAKING_ADDRESS=0x...
VITE_POOL_ADDRESS=0x...
```

---

## Performance Optimizations

### Frontend
- Code splitting (wagmi, React, react-query bundles)
- Lazy loading of tab components
- Memoization with TTL caching
- Input debouncing and throttling
- CSS code splitting
- Image preloading

### Smart Contracts
- Batch reads for efficiency
- View-only functions (no gas)
- Event-based indexing
- Storage packing

---

## Security

### Best Practices
- No external calls in loops
- Integer overflow/underflow protected
- Reentrancy guards on state changes
- Access control via Ownable
- Error boundary for React crashes
- Balance verification before interactions

---

## Testing

```bash
cd contracts

# Run all tests
forge test

# Specific test
forge test --match testStaking

# Coverage
forge coverage
```

---

## Monitoring

- Block Explorer: [BaseScan](https://basescan.org)
- Price Analytics: [GeckoTerminal](https://geckoterminal.com)
- Governance: [Tally](https://www.tally.xyz)

---

## Troubleshooting

**Wallet not connecting**: Verify Base network is selected and wallet has provider
**Stale data**: Refresh intervals are 8-30s; clear cache if needed
**Compilation error**: Ensure Solidity 0.8.19+

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Roadmap

- Governance snapshot voting
- Yield farming with multiple pools
- NFT tier badges
- Governance treasury
- Cross-chain bridging
- Mobile app
- Advanced charting

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

- GitHub Issues: [Report a bug](../../issues)
- Discord: [Join community](https://discord.gg/chonk9k)
- Docs: [Read guides](./docs)

---

<div align="center">

Built with Solidity, React, Viem, and Wagmi on Base Network

[Website](https://chonk9k.io) • [Twitter](https://twitter.com/chonk9k) • [GitHub](https://github.com/chonk9k)

</div>
