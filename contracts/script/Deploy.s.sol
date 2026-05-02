// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Chonk9kStaking.sol";

contract DeployChonk9kStaking is Script {
    // ── Config ──────────────────────────────────────────────────────────────
    address constant CHONK9K      = 0x063d41475AfAf969c12df8933b99928e1B17E5cc;
    address constant REWARD_TOKEN = 0x063d41475AfAf969c12df8933b99928e1B17E5cc; // same token
    uint256 constant REWARD_RATE  = 1_000_000 ether; // tokens per second — tune this

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        Chonk9kStaking staking = new Chonk9kStaking(
            CHONK9K,
            REWARD_TOKEN,
            REWARD_RATE,
            deployer
        );

        vm.stopBroadcast();

        console.log("Chonk9kStaking deployed at:", address(staking));
        console.log("Owner:", deployer);
        console.log("Reward rate:", REWARD_RATE, "tokens/sec");
        console.log("");
        console.log("Next steps:");
        console.log("1. Transfer reward tokens to staking contract");
        console.log("2. Update STAKING_ADDRESS in frontend .env");
        console.log("3. Verify: forge verify-contract <addr> src/Chonk9kStaking.sol:Chonk9kStaking --chain base");
    }
}
