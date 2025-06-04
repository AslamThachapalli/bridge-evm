// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IBASLC is IERC20 {
    function mint(address _to, uint256 _amount) external;
    function burn(address _account, uint256 _amount) external;
}

contract BridgeBase is Ownable {
    address public tokenAddress;

    mapping(address => uint256) pendingBalance;

    event Burn(address indexed burner, uint256 amount);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        tokenAddress = _tokenAddress;
    }

    function mint(uint256 _amount) public {
        require(pendingBalance[msg.sender] >= _amount);
        pendingBalance[msg.sender] -= _amount;
        IBASLC(tokenAddress).mint(msg.sender, _amount);
    }

    function burn(uint256 _amount) public {
        IBASLC(tokenAddress).burn(msg.sender, _amount);
        emit Burn(msg.sender, _amount);
    }

    function lockedOnOppositeChain(
        address _userAccount,
        uint256 _amount
    ) public onlyOwner {
        pendingBalance[_userAccount] += _amount;
    }
}
