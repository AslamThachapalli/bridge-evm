// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BridgeETH is Ownable {
    address public tokenAddress;

    mapping(address => uint256) pendingBalance;
    uint256 nonce;
    mapping(uint256 => bool) processedNonces;

    event Deposit(address indexed depositor, uint256 amount, uint256 nonce);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        tokenAddress = _tokenAddress;
    }

    function lock(uint256 _amount) public {
        require(
            IERC20(tokenAddress).allowance(msg.sender, address(this)) >= _amount
        );
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount);
        nonce += 1;
        emit Deposit(msg.sender, _amount, nonce);
    }

    function unlock(uint256 _amount) public {
        require(pendingBalance[msg.sender] >= _amount);
        IERC20(tokenAddress).transfer(msg.sender, _amount);
        pendingBalance[msg.sender] -= _amount;
    }

    function burnedOnOppositeChain(
        address _userAccount,
        uint256 _amount,
        uint256 _nonce
    ) public onlyOwner {
        require(!processedNonces[_nonce], "Nonce already processed");

        processedNonces[_nonce] = true;
        pendingBalance[_userAccount] += _amount;
    }
}
