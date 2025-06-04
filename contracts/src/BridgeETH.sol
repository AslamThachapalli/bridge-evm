// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BridgeETH is Ownable {
    address public tokenAddress;

    mapping(address => uint256) pendingBalance;

    event Deposit(address indexed depositor, uint256 amount);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        tokenAddress = _tokenAddress;
    }

    function lock(uint256 _amount) public {
        require(
            IERC20(tokenAddress).allowance(msg.sender, address(this)) >= _amount
        );
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount);
        emit Deposit(msg.sender, _amount);
    }

    function unlock(uint256 _amount) public {
        require(pendingBalance[msg.sender] >= _amount);
        IERC20(tokenAddress).transfer(msg.sender, _amount);
        pendingBalance[msg.sender] -= _amount;
    }

    function burnedOnOppositeChain(
        address _userAccount,
        uint256 _amount
    ) public onlyOwner {
        pendingBalance[_userAccount] += _amount;
    }
}
