// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/lending/LendingPool.sol";
import "../src/mocks/MockERC20.sol";

contract LendingPoolTest is Test {
    MockERC20 collateral;
    MockERC20 borrow;
    LendingPool pool;

    address user = address(1);
    address liquidator = address(2);

    function setUp() public {
        collateral = new MockERC20("Collateral", "COL", 1_000_000 ether);
        borrow = new MockERC20("Borrow", "BOR", 1_000_000 ether);

        pool = new LendingPool(address(collateral), address(borrow));

        collateral.transfer(user, 1000 ether);
        borrow.transfer(address(pool), 1000 ether);

        vm.startPrank(user);
        collateral.approve(address(pool), type(uint256).max);
        borrow.approve(address(pool), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(liquidator);
        borrow.approve(address(pool), type(uint256).max);
        vm.stopPrank();
    }

    // -------------------------
    // TEST 1: deposit works
    // -------------------------
    function testDeposit() public {
        vm.prank(user);
        pool.deposit(500 ether);

        assertEq(pool.collateral(user), 500 ether);
    }

    // -------------------------
    // TEST 2: borrow works
    // -------------------------
    function testBorrow() public {
        vm.prank(user);
        pool.deposit(500 ether);

        vm.prank(user);
        pool.borrow(300 ether);

        assertEq(pool.debt(user), 300 ether);
    }

    // -------------------------
    // TEST 3: borrow limit enforced
    // -------------------------
    function testBorrowLimit() public {
        vm.prank(user);
        pool.deposit(500 ether);

        vm.prank(user);

        vm.expectRevert("Too risky");
        pool.borrow(1000 ether);
    }

    // -------------------------
    // TEST 4: repay works
    // -------------------------
    function testRepay() public {
        vm.prank(user);
        pool.deposit(500 ether);

        vm.prank(user);
        pool.borrow(200 ether);

        vm.prank(user);
        pool.repay(100 ether);

        assertEq(pool.debt(user), 100 ether);
    }
}
