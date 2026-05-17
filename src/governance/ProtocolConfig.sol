// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProtocolConfig {
    address public governor;

    uint256 public ammFee = 3; // 0.3%
    uint256 public collateralFactor = 75;

    modifier onlyGovernor() {
        require(msg.sender == governor, "not governor");
        _;
    }

    constructor(address _governor) {
        governor = _governor;
    }

    function setAmmFee(uint256 newFee) external onlyGovernor {
        ammFee = newFee;
    }

    function setCollateralFactor(uint256 newFactor) external onlyGovernor {
        collateralFactor = newFactor;
    }
}
