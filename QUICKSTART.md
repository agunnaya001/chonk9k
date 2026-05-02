# CHONK9K Quick Start Guide

Get up and running with CHONK9K in 5 minutes.

## For Users

### 1. Access the App

Visit [chonk9k.io](https://chonk9k.io)

### 2. Connect Your Wallet

- Click "Connect Wallet" in top right
- Select Coinbase Wallet, MetaMask, or WalletConnect
- Ensure you're on Base network
- Approve connection

### 3. Explore Features

**Dashboard**
- View your CHONK9K balance
- Check token price and pool liquidity
- See contract stats

**Vesting**
- See your vesting progress
- Claim available tokens
- View total allocation

**Govern**
- Check your voting power
- Vote on proposals
- Delegate to other holders

**Swap**
- View price charts
- Execute swaps via Uniswap V4
- Check liquidity

**Analytics**
- Track holdings and rewards
- View staking metrics
- Monitor tier status

### 4. Stake Tokens

1. Go to Dashboard
2. Click "Stake" (if available)
3. Enter amount and lock period
4. Approve token spending
5. Confirm transaction

### 5. Claim Rewards

1. Go to Vesting or staking section
2. See "Claimable" amount
3. Click "Claim"
4. Confirm in wallet
5. Tokens arrive in ~1 minute

---

## For Developers

### Setup (5 minutes)

```bash
# Clone and install
git clone https://github.com/chonk9k/chonk9k
cd chonk9k

# Frontend
cd frontend
pnpm install
pnpm dev
# Open http://localhost:5173

# Contracts
cd ../contracts
forge build
forge test
```

### Project Structure

```
chonk9k/
├── frontend/              # React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Wagmi hooks
│   │   ├── utils/         # Utilities
│   │   └── abis/          # Contract ABIs
│   ├── package.json
│   └── vite.config.js
├── contracts/             # Smart contracts
│   ├── src/
│   │   └── Chonk9kStaking.sol
│   ├── test/
│   ├── script/
│   └── foundry.toml
└── README.md
```

### Key Files

**Frontend**
- `/frontend/src/App.jsx` - Main app component
- `/frontend/src/hooks/useChonk.js` - Contract hooks
- `/frontend/src/abis/index.js` - Contract ABIs

**Smart Contracts**
- `/contracts/src/Chonk9kStaking.sol` - Main contract
- `/contracts/test/Chonk9kStaking.t.sol` - Tests
- `/contracts/script/Deploy.s.sol` - Deployment script

### Common Tasks

**Run Frontend**
```bash
cd frontend
pnpm dev
```

**Compile Contracts**
```bash
cd contracts
forge build
```

**Run Tests**
```bash
cd contracts
forge test -v
```

**Deploy to Testnet**
```bash
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  --private-key 0x... \
  --broadcast
```

**Build Frontend for Production**
```bash
cd frontend
pnpm build
```

### Important Addresses

**Base Mainnet**
- Token: `0x...`
- Staking: `0x...`
- Pool: `0x...`

**Base Sepolia (Testnet)**
- Token: `0x...`
- Staking: `0x...`
- Pool: `0x...`

### Useful Links

- [Smart Contract Code](./contracts/src)
- [Frontend Code](./frontend/src)
- [API Documentation](./README.md#smart-contract-api)
- [Deployment Guide](./DEPLOYMENT.md)
- [GitHub Repo](https://github.com/chonk9k/chonk9k)

---

## Troubleshooting

### "Wallet not connecting"
- Switch to Base network in wallet
- Try different wallet (MetaMask → Coinbase)
- Clear browser cache

### "Transaction failed"
- Check you have enough ETH for gas
- Verify sufficient token balance
- Check network connection

### "Stale data showing"
- Refresh the page
- Check you're connected to correct network
- Wait for refetch (auto every 10-30s)

### "Contract not found"
- Verify correct network (Base, not Mainnet)
- Check contract address in .env
- Confirm contract is deployed

### "Build fails"
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Check Node version: `node --version` (need 18+)
- Check Solidity version: `solc --version` (need 0.8.19+)

---

## Learning Resources

- [Solidity Docs](https://docs.soliditylang.org)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Guide](https://viem.sh)
- [Base Documentation](https://docs.base.org)
- [React Documentation](https://react.dev)

---

## Getting Help

- GitHub Issues: [Report a bug](https://github.com/chonk9k/chonk9k/issues)
- Discord: [Join community](https://discord.gg/chonk9k)
- Twitter: [@chonk9k](https://twitter.com/chonk9k)

---

## Next Steps

1. Read the [full README](./README.md)
2. Explore the [deployment guide](./DEPLOYMENT.md)
3. Check the [changelog](./CHANGELOG.md)
4. Start building!

---

Happy coding!
