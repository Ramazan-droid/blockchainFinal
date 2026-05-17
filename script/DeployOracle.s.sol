//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/oracle/PriceOracle.sol";

contract DeployOracle is Script {
    function run(address feed) external returns (address) {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(pk);

        PriceOracle oracle = new PriceOracle(feed);

        vm.stopBroadcast();

        console.log("PriceOracle:", address(oracle));

        return address(oracle);
    }
}
