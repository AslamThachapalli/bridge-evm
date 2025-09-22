// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {BridgeBase} from "../src/BridgeBase.sol";
import {BASLC} from "../src/BASLC.sol";

contract BridgeBaseScript is Script {
    BASLC public baslc;
    BridgeBase public bridgeBase;

    function run() public {
        vm.createSelectFork("base-sepolia");
        vm.startBroadcast();

        baslc = new BASLC();
        bridgeBase = new BridgeBase(address(baslc));

        baslc.transferOwnership(address(bridgeBase));

        vm.stopBroadcast();
    }
}
