// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/extensions/ERC4626.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

contract SimpleVault is ERC4626 {
    using SafeERC20 for IERC20;

    constructor(IERC20 asset)
        ERC4626(asset)
        ERC20("Vault Share Token", "vSHARE")
    {}

    // optional hook: take fees later
    function deposit(uint256 assets, address receiver)
        public
        override
        returns (uint256)
    {
        return super.deposit(assets, receiver);
    }

    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public override returns (uint256) {
        return super.withdraw(assets, receiver, owner);
    }
}