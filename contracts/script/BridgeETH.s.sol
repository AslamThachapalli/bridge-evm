// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {BridgeETH} from "../src/BridgeETH.sol";
import {ASLC} from "../src/ASLC.sol";

contract BridgeETHScript is Script {
    function run() public {
        vm.createSelectFork("sepolia");
        vm.startBroadcast();
        new BridgeETH(address(new ASLC()));
        vm.stopBroadcast();
    }
}
