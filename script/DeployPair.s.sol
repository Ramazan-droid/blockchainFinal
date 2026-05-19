// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

interface IAMMFactory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

contract DeployPairScript is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        
        // Use your actual deployed AMMFactory address here
        address factoryAddr = 0xf7739216E54Ce3a8d9bc1BA2C4F2CBf06Cf091d2; 
        
        // Token addresses from your app.js layout
        address token0 = 0x47A8E2E46871e69c492Fc38a556ABeBD254248F6;
        address token1 = 0xB77881a01f7B504d553fa1d8Bd206D8b839bF8c0;

        vm.startBroadcast(privateKey);
        
        address pair;
        // Check if it already exists, otherwise deploy it
        pair = IAMMFactory(factoryAddr).getPair(token0, token1);
        if (pair == address(0)) {
            pair = IAMMFactory(factoryAddr).createPair(token0, token1);
        }
        
        vm.stopBroadcast();

        console.log("Actual AMMPair Contract Address:", pair);
    }
}