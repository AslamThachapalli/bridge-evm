// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// The Bridged Token, which is to be deployed in Base Sepolia.
// After deployment the token owner ship will be transferred to the BridgeBase contract.
// The Contract will mint and burn the coin as required.
contract BASLC is ERC20, Ownable {
    constructor() ERC20("BASLCOIN", "BASLC") Ownable(msg.sender) {}

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }

    function burn(address _account, uint256 _amount) public onlyOwner {
        _burn(_account, _amount);
    }
}
