# CHONK9K Deployment Guide

Complete guide for deploying CHONK9K smart contracts and frontend to production.

## Table of Contents

1. [Smart Contract Deployment](#smart-contract-deployment)
2. [Frontend Deployment](#frontend-deployment)
3. [Post-Deployment Verification](#post-deployment-verification)
4. [Monitoring](#monitoring)

---

## Smart Contract Deployment

### Prerequisites

- Foundry installed: `curl -L https://foundry.paradigm.xyz | bash`
- Private key with sufficient Base ETH for gas
- RPC endpoint for Base (mainnet or testnet)

### Environment Setup

```bash
cd contracts

# Create .env file
cat > .env << EOF
PRIVATE_KEY=0x...
RPC_URL=https://mainnet.base.org
ETHERSCAN_API_KEY=...
EOF

# Load environment
source .env
```

### Testnet Deployment (Base Sepolia)

```bash
# Use Sepolia testnet
export RPC_URL=https://sepolia.base.org
export PRIVATE_KEY=0x...

# Simulate deployment
forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# Deploy (requires confirmation)
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Mainnet Deployment (Base)

```bash
# Use Base mainnet
export RPC_URL=https://mainnet.base.org
export PRIVATE_KEY=0x...
export ETHERSCAN_API_KEY=...

# Verify setup
forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# Deploy with verification
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### Post-Deployment Steps

1. **Verify Contract Addresses**
   ```bash
   # Get deployment output
   cat broadcast/Deploy.s.sol/*/run-latest.json
   ```

2. **Update Frontend Configuration**
   Edit `/frontend/.env.local`:
   ```bash
   VITE_CHONK_ADDRESS=0x...
   VITE_STAKING_ADDRESS=0x...
   VITE_POOL_ADDRESS=0x...
   ```

3. **Verify on Explorer**
   - Visit [BaseScan](https://basescan.org)
   - Search for contract address
   - Verify source code matches

4. **Initialize Staking Pool**
   ```bash
   # Set reward rate, lock time, and tier thresholds
   cast send $STAKING_ADDRESS "setRewardPerSecond(uint256)" "1000000000000000000" \
     --rpc-url $RPC_URL --private-key $PRIVATE_KEY
   ```

---

## Frontend Deployment

### Prerequisites

- Node.js 18+
- pnpm or npm
- Vercel account (recommended)

### Local Build

```bash
cd frontend

# Install dependencies
pnpm install

# Build
pnpm build

# Preview
pnpm preview
```

### Vercel Deployment

#### Option 1: GitHub Integration (Recommended)

1. Push code to GitHub
   ```bash
   git add .
   git commit -m "Production release v1.0.0"
   git push origin main
   ```

2. Connect repo to Vercel
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Set root directory to `frontend/`
   - Click "Deploy"

3. Configure environment variables in Vercel dashboard
   ```
   VITE_CHONK_ADDRESS=0x...
   VITE_STAKING_ADDRESS=0x...
   VITE_POOL_ADDRESS=0x...
   VITE_RPC_URL=https://mainnet.base.org
   ```

#### Option 2: Manual Deployment

```bash
cd frontend

# Login to Vercel
pnpm install -g vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add VITE_CHONK_ADDRESS
vercel env add VITE_STAKING_ADDRESS
vercel env add VITE_POOL_ADDRESS
```

### Custom Domain

1. In Vercel dashboard: Settings → Domains
2. Add your domain (e.g., chonk9k.io)
3. Follow DNS setup instructions
4. Update DNS records at your registrar

---

## Post-Deployment Verification

### Contract Verification

```bash
# Check token balance
cast call $CHONK_ADDRESS "balanceOf(address)(uint256)" $OWNER_ADDRESS \
  --rpc-url $RPC_URL

# Check total supply
cast call $CHONK_ADDRESS "totalSupply()(uint256)" \
  --rpc-url $RPC_URL

# Check staking pool APY
cast call $STAKING_ADDRESS "rewardPerSecond()(uint256)" \
  --rpc-url $RPC_URL
```

### Frontend Verification

```bash
# Test frontend loads
curl -s https://chonk9k.io | grep "<title>"

# Check meta tags
curl -s https://chonk9k.io | grep "og:title"

# Lighthouse score (via command line)
lighthouse https://chonk9k.io --output=json
```

### Integration Testing

1. **Wallet Connection**
   - Connect wallet at frontend
   - Verify network detection (Base)
   - Check account display

2. **Dashboard**
   - Verify token balance displays
   - Check price from GeckoTerminal
   - Confirm pool status shows

3. **Vesting**
   - Check vesting progress bar
   - Verify claimable amount
   - Test claim button

4. **Staking**
   - Approve token spending
   - Stake tokens
   - Check pending rewards
   - Verify tier calculation

5. **Governance**
   - Check voting power
   - View proposals
   - Cast vote

---

## Monitoring

### On-Chain Monitoring

**Contract Events**
```bash
# Watch for Staked events
cast logs --address $STAKING_ADDRESS "event Staked(address indexed user, uint256 amount)" \
  --rpc-url $RPC_URL \
  --from-block $(cast block-number --rpc-url $RPC_URL) \
  --to-block latest
```

**Block Explorer**
- Monitor address: [BaseScan](https://basescan.org/address/$CHONK_ADDRESS)
- Track transactions
- Monitor holders

### Off-Chain Monitoring

**Price Data**
- GeckoTerminal: https://geckoterminal.com/base/pools/$POOL_ADDRESS
- Track volume, liquidity, price changes

**Analytics**
- Use Dune Analytics for custom dashboards
- Track TVL, user metrics
- Monitor governance participation

### Application Monitoring

**Vercel Analytics**
- Dashboard: vercel.com/projects
- Monitor deployment health
- Track error rates

**Browser Errors**
- Use Sentry or similar
- Track JavaScript errors
- Monitor user experience

---

## Rollback Procedures

### Contract Rollback

If deployment fails or vulnerability found:

```bash
# Deploy proxy pattern (recommended for future)
cast send $PROXY "upgradeTo(address)" $NEW_IMPLEMENTATION \
  --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# Or redeploy to new address and migrate liquidity
```

### Frontend Rollback

In Vercel dashboard:
- Go to Deployments
- Find previous successful deployment
- Click three dots → "Promote to Production"

---

## Maintenance

### Regular Tasks

**Daily**
- Monitor transaction failures
- Check error logs
- Verify data freshness

**Weekly**
- Review analytics
- Check performance metrics
- Monitor community reports

**Monthly**
- Analyze user behavior
- Plan improvements
- Security audit review

### Update Procedures

```bash
# Smart Contracts
cd contracts
forge install # Update dependencies
forge test
forge build

# Frontend
cd frontend
pnpm update
pnpm build
vercel --prod
```

---

## Emergency Procedures

### If Contract Becomes Unresponsive

1. Check RPC health
2. Verify contract is not locked/paused
3. Check for insufficient gas
4. Review transaction mempool

### If Frontend Crashes

1. Rollback to previous deployment
2. Check error logs in Vercel/browser console
3. Verify environment variables
4. Restart dev server if local

### If Security Issue Discovered

1. Pause contract (if pause mechanism exists)
2. Notify community
3. Deploy hotfix
4. Conduct security audit

---

## Support

For deployment issues:
- GitHub Issues: [Report a problem](https://github.com/chonk9k/issues)
- Discord: [Ask community](https://discord.gg/chonk9k)
- Email: deploy@chonk9k.io

---

Last updated: December 2024
