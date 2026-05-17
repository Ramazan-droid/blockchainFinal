// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/lending/LendingPool.sol";

contract DeployLending is Script {

    function run(address collateral, address borrow) external returns (address) {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(pk);

        LendingPool pool = new LendingPool(
            collateral,
            borrow
        );

        vm.stopBroadcast();

        console.log("LendingPool:", address(pool));

        return address(pool);
    }
}