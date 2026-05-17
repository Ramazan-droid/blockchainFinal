// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/amm/AMMPair.sol";
import "../src/mocks/MockERC20.sol";

contract AMMPairTest is Test {
    MockERC20 tokenA;
    MockERC20 tokenB;
    AMMPair pair;

    address user = address(1);

    function setUp() public {
        tokenA = new MockERC20("TokenA", "A", 1_000_000 ether);
        tokenB = new MockERC20("TokenB", "B", 1_000_000 ether);

        pair = new AMMPair(address(tokenA), address(tokenB));

        tokenA.transfer(user, 10_000 ether);
        tokenB.transfer(user, 10_000 ether);

        vm.startPrank(user);
        tokenA.approve(address(pair), type(uint256).max);
        tokenB.approve(address(pair), type(uint256).max);
        vm.stopPrank();
    }

    function testAddLiquidity() public {
        vm.prank(user);
        pair.addLiquidity(1000 ether, 1000 ether);

        assertEq(pair.reserve0(), 1000 ether);
        assertEq(pair.reserve1(), 1000 ether);
    }

    function testSwap0To1() public {
        vm.prank(user);
        pair.addLiquidity(1000 ether, 1000 ether);

        vm.prank(user);
        pair.swap0To1(100 ether);

        assertTrue(pair.reserve0() > 1000 ether);
        assertTrue(pair.reserve1() < 1000 ether);
    }

    function testInvariantKDoesNotBreak() public {
        vm.prank(user);
        pair.addLiquidity(1000 ether, 1000 ether);

        uint256 kBefore = pair.reserve0() * pair.reserve1();

        vm.prank(user);
        pair.swap0To1(100 ether);

        uint256 kAfter = pair.reserve0() * pair.reserve1();

        assertGe(kAfter, kBefore * 99 / 100);
    }
}
