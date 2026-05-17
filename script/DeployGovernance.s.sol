// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

import "../src/governance/GovToken.sol";
import "../src/governance/TimeLock.sol";
import "../src/governance/Governor.sol";
import "../src/governance/ProtocolConfig.sol";

contract DeployGovernance is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);

        // =========================
        // 1. Deploy Governance Token
        // =========================
        GovToken token = new GovToken();

        // =========================
        // 2. Deploy Timelock
        // =========================

        address[] memory proposers = new address[](1);
        proposers[0] = address(0); // temporary placeholder

        address[] memory executors = new address[](1);
        executors[0] = address(0); // open execution

        TimeLock timelock = new TimeLock(2 days, proposers, executors);

        // =========================
        // 3. Deploy Governor
        // =========================
        MyGovernor governor = new MyGovernor(token, timelock);

        // =========================
        // 4. Fix Timelock Roles
        // =========================

        bytes32 proposerRole = timelock.PROPOSER_ROLE();
        bytes32 executorRole = timelock.EXECUTOR_ROLE();
        bytes32 adminRole = timelock.DEFAULT_ADMIN_ROLE();

        // Governor becomes proposer
        timelock.grantRole(proposerRole, address(governor));

        // Allow anyone (or governor) to execute
        timelock.grantRole(executorRole, address(0));

        // Remove deployer admin rights (security best practice)
        timelock.revokeRole(adminRole, deployer);

        // =========================
        // 5. Deploy Protocol Config
        // =========================
        ProtocolConfig config = new ProtocolConfig(address(governor));

        vm.stopBroadcast();

        // =========================
        // Logs
        // =========================
        console.log("GovToken:", address(token));
        console.log("Timelock:", address(timelock));
        console.log("Governor:", address(governor));
        console.log("ProtocolConfig:", address(config));
    }
}
