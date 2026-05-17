//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/vault/SimpleVault.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract DeployVault is Script {
    function run(address asset) external returns (address) {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(pk);

        SimpleVault vault = new SimpleVault(IERC20(asset));

        vm.stopBroadcast();

        console.log("SimpleVault:", address(vault));

        return address(vault);
    }
}
