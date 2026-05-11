// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract LendingPool {
    using SafeERC20 for IERC20;

    IERC20 public collateralToken;
    IERC20 public borrowToken;

    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;

    uint256 public collateralFactor = 75; // 75%

    constructor(address _collateral, address _borrow) {
        collateralToken = IERC20(_collateral);
        borrowToken = IERC20(_borrow);
    }

    // -------------------
    // DEPOSIT COLLATERAL
    // -------------------
    function deposit(uint256 amount) external {
        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        collateral[msg.sender] += amount;
    }

    // -------------------
    // BORROW
    // -------------------
    function borrow(uint256 amount) external {
        uint256 maxBorrow = (collateral[msg.sender] * collateralFactor) / 100;

        require(debt[msg.sender] + amount <= maxBorrow, "Too risky");

        debt[msg.sender] += amount;
        borrowToken.safeTransfer(msg.sender, amount);
    }

    // -------------------
    // REPAY
    // -------------------
    function repay(uint256 amount) external {
        borrowToken.safeTransferFrom(msg.sender, address(this), amount);
        debt[msg.sender] -= amount;
    }

    // -------------------
    // LIQUIDATION (simple)
    // -------------------
    function liquidate(address user, uint256 repayAmount) external {
        uint256 maxBorrow = (collateral[user] * collateralFactor) / 100;

        require(debt[user] > maxBorrow, "Not liquidatable");

        borrowToken.safeTransferFrom(msg.sender, address(this), repayAmount);

        debt[user] -= repayAmount;

        uint256 collateralSeized = repayAmount;

        collateral[user] -= collateralSeized;
        collateralToken.safeTransfer(msg.sender, collateralSeized);
    }
}