// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.20;

import "./interface/IEmployeeToken.sol";

contract EmployeeShares {
	IEmployeeToken public EmployeeToken;

	event Trade(
		address trader,
		address subject,
		bool isBuy,
		uint256 shareAmount,
		uint256 ethAmount,
		uint256 supply
	);

	// SharesSubject => (Holder => Balance)
	mapping(address => mapping(address => uint256)) public sharesBalance;

	// SharesSubject => Supply
	mapping(address => uint256) public sharesSupply;

	constructor(address _EmployeeToken) {
		EmployeeToken = IEmployeeToken(_EmployeeToken);
	}

	function getPrice(
		uint256 supply,
		uint256 amount
	) public pure returns (uint256) {
		uint256 sum1 = supply == 0
			? 0
			: ((supply - 1) * (supply) * (2 * (supply - 1) + 1)) / 6;
		uint256 sum2 = supply == 0 && amount == 1
			? 0
			: ((supply - 1 + amount) *
				(supply + amount) *
				(2 * (supply - 1 + amount) + 1)) / 6;
		uint256 summation = sum2 - sum1;
		return (summation * 1 ether) / 16000;
	}

	function getBuyPrice(
		address sharesSubject,
		uint256 amount
	) public view returns (uint256) {
		return getPrice(sharesSupply[sharesSubject], amount);
	}

	function getSellPrice(
		address sharesSubject,
		uint256 amount
	) public view returns (uint256) {
		return getPrice(sharesSupply[sharesSubject] - amount, amount);
	}

	function buyShares(address sharesSubject, uint256 amount) public payable {
		uint256 supply = sharesSupply[sharesSubject];
		require(
			supply > 0 || sharesSubject == msg.sender,
			"Only the shares' subject can buy the first share"
		);
		uint256 price = getPrice(supply, amount);
		require(msg.value >= price, "Insufficient payment");
		sharesBalance[sharesSubject][msg.sender] =
			sharesBalance[sharesSubject][msg.sender] +
			amount;
		sharesSupply[sharesSubject] = supply + amount;
		emit Trade(
			msg.sender,
			sharesSubject,
			true,
			amount,
			price,
			supply + amount
		);
		EmployeeToken.transfersFrom(sharesSubject, msg.sender, amount);
	}

	function sellShares(address sharesSubject, uint256 amount) public payable {
		uint256 supply = sharesSupply[sharesSubject];
		require(supply > amount, "Cannot sell the last share");
		uint256 price = getPrice(supply - amount, amount);
		require(
			sharesBalance[sharesSubject][msg.sender] >= amount,
			"Insufficient shares"
		);
		sharesBalance[sharesSubject][msg.sender] =
			sharesBalance[sharesSubject][msg.sender] -
			amount;
		sharesSupply[sharesSubject] = supply - amount;
		emit Trade(
			msg.sender,
			sharesSubject,
			false,
			amount,
			price,
			supply - amount
		);
		(bool sent, ) = payable(msg.sender).call{ value: price }("");
		EmployeeToken.transfersFrom(msg.sender, sharesSubject, amount);
		require(sent, "Failed to send Ether");
	}
}
