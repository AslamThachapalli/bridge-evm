// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";
import "src/BridgeETH.sol";
import "src/ASLC.sol";

contract BridgeETHTest is Test {
    BridgeETH bridgeEth;
    ASLC aslc;
    event Deposit(address indexed depositor, uint256 amount);

    address user = address(1);

    function setUp() public {
        aslc = new ASLC();
        bridgeEth = new BridgeETH(address(aslc));
    }

    function testLock() public {
        aslc.approve(address(bridgeEth), 50);

        vm.expectEmit(true, false, false, true);
        emit Deposit(address(this), 50);
        bridgeEth.lock(50);
    }

    function test_RevertWhen_TokenIsNotApproved() public {
        vm.expectRevert();
        bridgeEth.lock(50);
    }

    function test_RevertWhen_TransferingMoreThanApprovedAmount() public {
        aslc.approve(address(bridgeEth), 50);

        vm.expectRevert();
        bridgeEth.lock(100);
    }

    function testUnlock() public {
        uint256 amount = 20;

        aslc.mint(user, 100);

        vm.startPrank(user);
        aslc.approve(address(bridgeEth), amount);
        bridgeEth.lock(amount);
        vm.stopPrank();

        bridgeEth.burnedOnOppositeChain(user, amount);

        vm.startPrank(user);
        uint256 balanceBefore = aslc.balanceOf(user);
        bridgeEth.unlock(amount);
        vm.stopPrank();

        assertEq(aslc.balanceOf(user), balanceBefore + amount);
    }

    function test_RevertWhen_NotEnoughBalance() public {
        uint256 amount = 50 ether;

        // Owner only sets pendingBalance to 10 ether
        bridgeEth.burnedOnOppositeChain(user, 10 ether);

        // User tries to unlock 50 ether (should revert)
        vm.startPrank(user);
        vm.expectRevert();
        bridgeEth.unlock(amount);
        vm.stopPrank();
    }
}
