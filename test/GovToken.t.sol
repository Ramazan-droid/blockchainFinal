// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/governance/GovToken.sol";

contract GovTokenTest is Test {
    GovToken token;

    function setUp() public {
        token = new GovToken();
    }

    function testInitialSupply() public {
        assertEq(token.totalSupply(), 1_000_000 ether);
    }

    function testMint() public {
        token.mint(address(1), 100 ether);

        assertEq(token.balanceOf(address(1)), 100 ether);
    }
}
