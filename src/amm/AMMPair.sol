// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

contract AMMPair {
    using SafeERC20 for IERC20;

    IERC20 public token0;
    IERC20 public token1;

    uint256 public reserve0;
    uint256 public reserve1;

    uint256 public totalSupplyLP;
    mapping(address => uint256) public lpBalance;

    constructor(address _token0, address _token1) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    // ---------------------------
    // ADD LIQUIDITY
    // ---------------------------
    function addLiquidity(uint256 amount0, uint256 amount1) external {
        token0.safeTransferFrom(msg.sender, address(this), amount0);
        token1.safeTransferFrom(msg.sender, address(this), amount1);

        uint256 liquidity = amount0 + amount1; // simplified LP math

        lpBalance[msg.sender] += liquidity;
        totalSupplyLP += liquidity;

        reserve0 += amount0;
        reserve1 += amount1;
    }

    // ---------------------------
    // SWAP token0 -> token1
    // ---------------------------
    function swap0To1(uint256 amountIn) external {
        token0.safeTransferFrom(msg.sender, address(this), amountIn);

        uint256 amountInWithFee = (amountIn * 997) / 1000;

        uint256 amountOut = (amountInWithFee * reserve1) / (reserve0 + amountInWithFee);

        reserve0 += amountIn;
        reserve1 -= amountOut;

        token1.safeTransfer(msg.sender, amountOut);
    }

    // ---------------------------
    // SWAP token1 -> token0
    // ---------------------------
    function swap1To0(uint256 amountIn) external {
        token1.safeTransferFrom(msg.sender, address(this), amountIn);

        uint256 amountInWithFee = (amountIn * 997) / 1000;

        uint256 amountOut = (amountInWithFee * reserve0) / (reserve1 + amountInWithFee);

        reserve1 += amountIn;
        reserve0 -= amountOut;

        token0.safeTransfer(msg.sender, amountOut);
    }
}
