// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PriceOracle {
    AggregatorV3Interface public priceFeed;
    uint256 public maxDelay = 1 hours;

    constructor(address _feed) {
        priceFeed = AggregatorV3Interface(_feed);
    }

    function getPrice() external view returns (uint256) {
        (
            ,
            int256 price,
            ,
            uint256 updatedAt,

        ) = priceFeed.latestRoundData();

        require(price > 0, "invalid price");
        require(block.timestamp - updatedAt <= maxDelay, "stale price");

        return uint256(price);
    }
}