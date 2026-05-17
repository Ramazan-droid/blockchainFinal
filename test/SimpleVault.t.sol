// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/vault/SimpleVault.sol";
import "../src/mocks/MockERC20.sol";

contract VaultTest is Test {
    MockERC20 asset;
    SimpleVault vault;

    address user = address(1);

    function setUp() public {
        asset = new MockERC20("Asset", "AST", 1_000_000 ether);
        vault = new SimpleVault(asset);

        asset.transfer(user, 1000 ether);

        vm.startPrank(user);
        asset.approve(address(vault), type(uint256).max);
        vm.stopPrank();
    }

    function testDeposit() public {
        vm.prank(user);
        uint256 shares = vault.deposit(100 ether, user);

        assertGt(shares, 0);
        assertEq(vault.balanceOf(user), shares);
    }

    function testWithdraw() public {
        vm.startPrank(user);
        uint256 shares = vault.deposit(100 ether, user);
        vault.withdraw(100 ether, user, user);
        vm.stopPrank();

        assertEq(asset.balanceOf(user), 1000 ether);
    }
}
