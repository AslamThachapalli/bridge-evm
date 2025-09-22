// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// A Custom ERC Token to simulate the bridge.
// The Token to be deployed in ETH Sepolia and mint myself some coin to get started with the bridge.
contract ASLC is ERC20 {
    constructor() ERC20("ASLCOIN", "ASLC") {
        // Mint 1000 ASLC coins to the owner
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

    function mint(address _to, uint256 _amount) public {
        require(_amount <= 1000 * 10 ** decimals(), "Max 1000 ASLC per call");
        _mint(_to, _amount * 10 ** decimals());
    }
}
