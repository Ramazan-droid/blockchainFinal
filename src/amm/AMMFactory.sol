// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AMMPair.sol";

contract AMMFactory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint256 index);

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "same token");
        require(getPair[tokenA][tokenB] == address(0), "exists");

        bytes32 salt = keccak256(abi.encodePacked(tokenA, tokenB));

        pair = address(new AMMPair{salt: salt}(tokenA, tokenB));

        getPair[tokenA][tokenB] = pair;
        getPair[tokenB][tokenA] = pair;

        allPairs.push(pair);

        emit PairCreated(tokenA, tokenB, pair, allPairs.length);
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }
}
