// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "src/BridgeBase.sol";
import "src/BASLC.sol";

contract BridgeBaseTest is Test {
    BASLC baslc;
    BridgeBase bridgeBase;

    event Burn(address indexed burner, uint256 amount);

    address user = address(1);

    function setUp() public {
        baslc = new BASLC();
        bridgeBase = new BridgeBase(address(baslc));

        baslc.transferOwnership(address(bridgeBase));
    }

    function testMint() public {
        uint256 amount = 100 ether;
        bridgeBase.lockedOnOppositeChain(user, amount);

        vm.startPrank(user);
        uint256 balanceBefore = baslc.balanceOf(user);
        bridgeBase.mint(amount);
        vm.stopPrank();

        assertEq(baslc.balanceOf(user), balanceBefore + amount);
    }

    function test_RevertWhen_NotEnoughBalanceForMinting() public {
        bridgeBase.lockedOnOppositeChain(user, 50);

        vm.expectRevert();
        vm.prank(user);
        bridgeBase.mint(100);
    }

    function testBurn() public {
        vm.prank(address(bridgeBase));
        baslc.mint(user, 200);

        uint256 amount = 100;
        vm.expectEmit(true, false, false, true);
        emit Burn(user, amount);
        vm.prank(user);
        bridgeBase.burn(amount);
    }

    function test_RevertWhen_NotEnoughBalanceForBurning() public {
        vm.prank(address(bridgeBase));
        baslc.mint(user, 100);

        vm.expectRevert();
        vm.prank(user);
        bridgeBase.burn(200);
    }
}
