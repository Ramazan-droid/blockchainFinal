// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/amm/AMMFactory.sol";

contract DeployFactory is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(privateKey);

        AMMFactory factory = new AMMFactory();

        vm.stopBroadcast();

        console.log("AMMFactory deployed at:", address(factory));
    }
}
