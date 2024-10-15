// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract FurVault {
    IERC20 public token;
    uint256 public rate;
    address public owner;

    mapping(address => bool) public whitelist;

    constructor(IERC20 _token) {
        token = _token;
        rate = 100; 
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], "Not whitelisted");
        _;
    }


    receive() external payable {
        uint256 tokenAmount = msg.value * rate;

        uint256 contractTokenBalance = token.balanceOf(address(this));
        require(contractTokenBalance >= tokenAmount, "Not enough tokens in contract");

        require(token.transfer(msg.sender, tokenAmount), "Token transfer failed");
    }

    function addToWhitelist(address _address) external onlyOwner {
        whitelist[_address] = true;
    }

    function removeFromWhitelist(address _address) external onlyOwner {
        whitelist[_address] = false;
    }


    function withdrawETH(uint256 amount) external onlyWhitelisted {
        uint256 contractBalance = address(this).balance;
        uint256 maxWithdrawal = (contractBalance * 95) / 100; // 95% of the contract balance

        require(amount < maxWithdrawal, "Withdrawal exceeds 95% limit");
        payable(msg.sender).transfer(amount);
    }


    function updateRate(uint256 _rate) external onlyOwner {
        require(_rate > 0, "Rate must be greater than 0");
        rate = _rate;
    }

    function ownerWithdrawETH() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
