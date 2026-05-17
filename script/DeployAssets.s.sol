// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/mocks/MockERC20.sol";

contract DeployAssets is Script {
    function run() external returns (address collateral, address borrow) {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(pk);

        MockERC20 collateralToken = new MockERC20("Collateral Token", "COL", 1_000_000 ether);

        MockERC20 borrowToken = new MockERC20("Borrow Token", "BOR", 1_000_000 ether);

        vm.stopBroadcast();

        console.log("Collateral Token:", address(collateralToken));
        console.log("Borrow Token:", address(borrowToken));

        return (address(collateralToken), address(borrowToken));
    }
}
