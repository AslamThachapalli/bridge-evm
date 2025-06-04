// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// A Custom ERC Token to simulate the bridge.
// The Token to be deployed in ETH Sepolia and mint myself some coin to get started with the bridge.
contract ASLC is ERC20, Ownable {
    constructor() ERC20("ASLCOIN", "ASLC") Ownable(msg.sender) {}

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}
