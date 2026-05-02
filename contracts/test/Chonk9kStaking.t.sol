// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Chonk9kStaking.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract Chonk9kStakingTest is Test {
    Chonk9kStaking staking;
    MockERC20 chonk;
    MockERC20 reward;

    address owner = address(0x1);
    address alice = address(0x2);
    address bob   = address(0x3);

    uint256 constant REWARD_RATE = 1 ether; // 1 token/sec

    function setUp() public {
        chonk  = new MockERC20("CHONK9K", "CHONK");
        reward = new MockERC20("Reward", "RWD");

        vm.prank(owner);
        staking = new Chonk9kStaking(address(chonk), address(reward), REWARD_RATE, owner);

        // Fund reward pool
        reward.mint(address(staking), 1_000_000 ether);

        // Fund users
        chonk.mint(alice, 10_000_000_000 ether);
        chonk.mint(bob,   10_000_000_000 ether);

        vm.prank(alice);
        chonk.approve(address(staking), type(uint256).max);
        vm.prank(bob);
        chonk.approve(address(staking), type(uint256).max);
    }

    // ---- Stake ----

    function test_StakeFlexible() public {
        vm.prank(alice);
        staking.stake(1_000 ether, 0);

        (uint256 amount,,,) = staking.stakeInfo(alice);
        assertEq(amount, 1_000 ether);
        assertEq(staking.totalStaked(), 1_000 ether);
    }

    function test_StakeWithLock() public {
        vm.prank(alice);
        staking.stake(1_000 ether, staking.LOCK_30D());

        assertTrue(staking.isLocked(alice));
    }

    function test_RevertStakeZero() public {
        vm.prank(alice);
        vm.expectRevert(Chonk9kStaking.ZeroAmount.selector);
        staking.stake(0, 0);
    }

    function test_RevertInvalidLock() public {
        vm.prank(alice);
        vm.expectRevert(Chonk9kStaking.InvalidLockDuration.selector);
        staking.stake(1_000 ether, 1 days); // not a valid lock
    }

    // ---- Rewards ----

    function test_PendingRewardsAccrue() public {
        vm.prank(alice);
        staking.stake(1_000 ether, 0);

        vm.warp(block.timestamp + 100);

        uint256 pending = staking.pendingRewards(alice);
        assertApproxEqAbs(pending, 100 ether, 1 ether);
    }

    function test_ClaimRewards() public {
        vm.prank(alice);
        staking.stake(1_000 ether, 0);

        vm.warp(block.timestamp + 100);

        uint256 before = reward.balanceOf(alice);
        vm.prank(alice);
        staking.claim();
        uint256 afterClaim = reward.balanceOf(alice);

        assertGt(afterClaim, before);
    }

    function test_MultiUserRewardSplit() public {
        vm.prank(alice);
        staking.stake(1_000 ether, 0);
        vm.prank(bob);
        staking.stake(1_000 ether, 0);

        vm.warp(block.timestamp + 100);

        uint256 alicePending = staking.pendingRewards(alice);
        uint256 bobPending   = staking.pendingRewards(bob);

        // Both should get ~50 tokens each (split evenly)
        assertApproxEqAbs(alicePending, 50 ether, 2 ether);
        assertApproxEqAbs(bobPending,   50 ether, 2 ether);
    }

    // ---- Unstake ----

    function test_UnstakeFlexible() public {
        vm.prank(alice);
        staking.stake(1_000 ether, 0);

        uint256 before = chonk.balanceOf(alice);
        vm.prank(alice);
        staking.unstake(1_000 ether);

        assertEq(chonk.balanceOf(alice), before + 1_000 ether);
        assertEq(staking.totalStaked(), 0);
    }

    function test_RevertUnstakeWhileLocked() public {
        vm.prank(alice);
        staking.stake(1_000 ether, staking.LOCK_30D());

        vm.prank(alice);
        vm.expectRevert();
        staking.unstake(1_000 ether);
    }

    function test_UnstakeAfterLock() public {
        vm.prank(alice);
        staking.stake(1_000 ether, staking.LOCK_30D());

        vm.warp(block.timestamp + staking.LOCK_30D() + 1);

        vm.prank(alice);
        staking.unstake(1_000 ether);

        (uint256 amount,,,) = staking.stakeInfo(alice);
        assertEq(amount, 0);
    }

    // ---- Tiers ----

    function test_TierChonker() public {
        vm.prank(alice);
        staking.stake(staking.TIER_CHONKER(), 0);
        assertEq(staking.tierOf(alice), 1);
    }

    function test_TierWhale() public {
        vm.prank(alice);
        staking.stake(staking.TIER_WHALE(), 0);
        assertEq(staking.tierOf(alice), 2);
    }

    function test_TierNone() public {
        assertEq(staking.tierOf(alice), 0);
    }

    // ---- Emergency ----

    function test_EmergencyWithdraw() public {
        vm.prank(alice);
        staking.stake(1_000 ether, staking.LOCK_30D());

        uint256 before = chonk.balanceOf(alice);
        vm.prank(alice);
        staking.emergencyWithdraw();

        assertEq(chonk.balanceOf(alice), before + 1_000 ether);
        (uint256 amount,,,) = staking.stakeInfo(alice);
        assertEq(amount, 0);
    }

    // ---- Admin ----

    function test_SetRewardRate() public {
        vm.prank(owner);
        staking.setRewardPerSecond(2 ether);
        assertEq(staking.rewardPerSecond(), 2 ether);
    }

    function test_RevertSetRateNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        staking.setRewardPerSecond(2 ether);
    }

    function test_PauseUnpause() public {
        vm.prank(owner);
        staking.pause();

        vm.prank(alice);
        vm.expectRevert();
        staking.stake(1_000 ether, 0);

        vm.prank(owner);
        staking.unpause();

        vm.prank(alice);
        staking.stake(1_000 ether, 0); // should work now
    }
}
