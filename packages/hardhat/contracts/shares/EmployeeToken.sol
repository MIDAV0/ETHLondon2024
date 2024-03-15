// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EmployeeToken is ERC20, Ownable {
	constructor(uint256 _totalSupply) ERC20("EmployeeToken", "ET") {
		_mint(msg.sender, _totalSupply);
	}

	function mint(address to, uint256 amount) public onlyOwner {
		_mint(to, amount);
	}

	function transfersFrom(
		address from,
		address to,
		uint256 amount
	) public onlyOwner {
		_transfer(from, to, amount);
	}

	// The following functions are overrides required by Solidity.

	function _afterTokenTransfer(
		address from,
		address to,
		uint256 amount
	) internal override(ERC20) {
		super._afterTokenTransfer(from, to, amount);
	}

	function _mint(address to, uint256 amount) internal override(ERC20) {
		super._mint(to, amount);
	}
}
