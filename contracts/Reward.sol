// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Fur is ERC20 {

    uint256 private constant INITIAL_SUPPLY = 120_000_000_000 * (10 ** 18); 

    constructor() ERC20("FurReward", "FUR") {
        _mint(msg.sender, INITIAL_SUPPLY); 
    }

}
