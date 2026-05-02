// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title Chonk9kStaking
/// @notice Stake CHONK9K to earn rewards, accumulate vote weight, and unlock tiers
contract Chonk9kStaking is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // -------------------------------------------------------------------------
    // Types
    // -------------------------------------------------------------------------

    struct StakeInfo {
        uint256 amount;         // tokens staked
        uint256 rewardDebt;     // reward debt for pool accounting
        uint256 stakedAt;       // timestamp of last stake
        uint256 lockEnd;        // optional lock end timestamp
    }

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    IERC20 public immutable chonk;          // CHONK9K token
    IERC20 public immutable rewardToken;    // reward token (can be same as chonk)

    uint256 public rewardPerSecond;         // rewards emitted per second
    uint256 public accRewardPerShare;       // accumulated rewards per share (scaled 1e18)
    uint256 public lastRewardTime;          // last time rewards were updated
    uint256 public totalStaked;             // total tokens staked

    mapping(address => StakeInfo) public stakeInfo;

    // Tiers: hold thresholds for feature unlocks
    uint256 public constant TIER_CHONKER  = 1_000_000_000 ether;   // 1B CHONK
    uint256 public constant TIER_WHALE    = 100_000_000_000 ether;  // 100B CHONK
    uint256 public constant TIER_MEGACHONK = 1_000_000_000_000 ether; // 1T CHONK

    // Lock durations → bonus multiplier (basis points, 10000 = 1x)
    uint256 public constant LOCK_30D  = 30 days;
    uint256 public constant LOCK_90D  = 90 days;
    uint256 public constant LOCK_180D = 180 days;

    uint256 public constant BONUS_30D  = 500;   // +5%
    uint256 public constant BONUS_90D  = 1500;  // +15%
    uint256 public constant BONUS_180D = 3000;  // +30%

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event Staked(address indexed user, uint256 amount, uint256 lockDuration);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error ZeroAmount();
    error StillLocked(uint256 unlockTime);
    error InsufficientStake();
    error InvalidLockDuration();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(
        address chonk_,
        address rewardToken_,
        uint256 rewardPerSecond_,
        address owner_
    ) Ownable(owner_) {
        chonk = IERC20(chonk_);
        rewardToken = IERC20(rewardToken_);
        rewardPerSecond = rewardPerSecond_;
        lastRewardTime = block.timestamp;
    }

    // -------------------------------------------------------------------------
    // Core: Stake
    // -------------------------------------------------------------------------

    /// @notice Stake CHONK9K tokens, optionally with a lock period for bonus rewards
    /// @param amount Token amount to stake
    /// @param lockDuration 0 = flexible, or LOCK_30D / LOCK_90D / LOCK_180D
    function stake(uint256 amount, uint256 lockDuration) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        if (lockDuration != 0 && lockDuration != LOCK_30D && lockDuration != LOCK_90D && lockDuration != LOCK_180D) {
            revert InvalidLockDuration();
        }

        _updatePool();

        StakeInfo storage info = stakeInfo[msg.sender];

        // Claim pending rewards before changing stake
        if (info.amount > 0) {
            uint256 pending = _pendingRewards(msg.sender);
            if (pending > 0) _safeRewardTransfer(msg.sender, pending);
        }

        // Pull tokens
        chonk.safeTransferFrom(msg.sender, address(this), amount);

        // Apply lock bonus to effective amount for reward calculation
        uint256 effectiveAmount = amount + (amount * _lockBonus(lockDuration)) / 10000;

        info.amount += amount;
        info.rewardDebt = (totalStaked > 0)
            ? info.rewardDebt + (effectiveAmount * accRewardPerShare) / 1e18
            : 0;
        info.stakedAt = block.timestamp;

        // Only extend lock if new lock is longer
        uint256 newLockEnd = block.timestamp + lockDuration;
        if (newLockEnd > info.lockEnd) info.lockEnd = newLockEnd;

        totalStaked += amount;

        emit Staked(msg.sender, amount, lockDuration);
    }

    // -------------------------------------------------------------------------
    // Core: Unstake
    // -------------------------------------------------------------------------

    /// @notice Withdraw staked tokens (must be past lock period)
    /// @param amount Amount to withdraw
    function unstake(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        StakeInfo storage info = stakeInfo[msg.sender];
        if (info.amount < amount) revert InsufficientStake();
        if (block.timestamp < info.lockEnd) revert StillLocked(info.lockEnd);

        _updatePool();

        uint256 pending = _pendingRewards(msg.sender);
        if (pending > 0) _safeRewardTransfer(msg.sender, pending);

        info.amount -= amount;
        info.rewardDebt = (info.amount * accRewardPerShare) / 1e18;
        totalStaked -= amount;

        chonk.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    // -------------------------------------------------------------------------
    // Core: Claim
    // -------------------------------------------------------------------------

    /// @notice Claim pending rewards without unstaking
    function claim() external nonReentrant whenNotPaused {
        _updatePool();
        uint256 pending = _pendingRewards(msg.sender);
        if (pending == 0) revert ZeroAmount();

        stakeInfo[msg.sender].rewardDebt = (stakeInfo[msg.sender].amount * accRewardPerShare) / 1e18;
        _safeRewardTransfer(msg.sender, pending);

        emit RewardClaimed(msg.sender, pending);
    }

    // -------------------------------------------------------------------------
    // Core: Emergency Withdraw (forfeits rewards)
    // -------------------------------------------------------------------------

    function emergencyWithdraw() external nonReentrant {
        StakeInfo storage info = stakeInfo[msg.sender];
        uint256 amount = info.amount;
        if (amount == 0) revert ZeroAmount();

        totalStaked -= amount;
        info.amount = 0;
        info.rewardDebt = 0;
        info.lockEnd = 0;

        chonk.safeTransfer(msg.sender, amount);
        emit EmergencyWithdraw(msg.sender, amount);
    }

    // -------------------------------------------------------------------------
    // Views
    // -------------------------------------------------------------------------

    /// @notice Pending unclaimed rewards for a user
    function pendingRewards(address user) external view returns (uint256) {
        return _pendingRewards(user);
    }

    /// @notice Tier level: 0=none, 1=Chonker, 2=Whale, 3=MegaChonk
    function tierOf(address user) external view returns (uint256) {
        uint256 amount = stakeInfo[user].amount;
        if (amount >= TIER_MEGACHONK) return 3;
        if (amount >= TIER_WHALE)     return 2;
        if (amount >= TIER_CHONKER)   return 1;
        return 0;
    }

    /// @notice Whether user's stake is currently locked
    function isLocked(address user) external view returns (bool) {
        return block.timestamp < stakeInfo[user].lockEnd;
    }

    /// @notice Vote power = staked amount (mirrors ERC20Votes delegation pattern)
    function votePower(address user) external view returns (uint256) {
        return stakeInfo[user].amount;
    }

    // -------------------------------------------------------------------------
    // Admin
    // -------------------------------------------------------------------------

    function setRewardPerSecond(uint256 rate) external onlyOwner {
        _updatePool();
        rewardPerSecond = rate;
        emit RewardRateUpdated(rate);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /// @notice Recover accidentally sent tokens (not CHONK)
    function recoverERC20(address token, uint256 amount) external onlyOwner {
        require(token != address(chonk), "Cannot recover staked token");
        IERC20(token).safeTransfer(owner(), amount);
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    function _updatePool() internal {
        if (block.timestamp <= lastRewardTime) return;
        if (totalStaked == 0) {
            lastRewardTime = block.timestamp;
            return;
        }
        uint256 elapsed = block.timestamp - lastRewardTime;
        uint256 reward = elapsed * rewardPerSecond;
        accRewardPerShare += (reward * 1e18) / totalStaked;
        lastRewardTime = block.timestamp;
    }

    function _pendingRewards(address user) internal view returns (uint256) {
        StakeInfo storage info = stakeInfo[user];
        if (info.amount == 0) return 0;

        uint256 acc = accRewardPerShare;
        if (block.timestamp > lastRewardTime && totalStaked > 0) {
            uint256 elapsed = block.timestamp - lastRewardTime;
            acc += (elapsed * rewardPerSecond * 1e18) / totalStaked;
        }
        return (info.amount * acc) / 1e18 - info.rewardDebt;
    }

    function _lockBonus(uint256 duration) internal pure returns (uint256) {
        if (duration == LOCK_180D) return BONUS_180D;
        if (duration == LOCK_90D)  return BONUS_90D;
        if (duration == LOCK_30D)  return BONUS_30D;
        return 0;
    }

    function _safeRewardTransfer(address to, uint256 amount) internal {
        uint256 bal = rewardToken.balanceOf(address(this));
        rewardToken.safeTransfer(to, amount > bal ? bal : amount);
    }
}
