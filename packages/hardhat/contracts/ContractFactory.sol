//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0 <0.9.0;

import "./StakingContract.sol";

contract ContractFactory {
	uint256 public constant MIN_HOURS = 24;
	uint256 public constant MAX_HOURS = 720;

	struct FreelancerInfo {
		uint256 id;
		string name;
		string description;
		address stakingContractAddress;
		address owner;
	}

	uint256 public idCounter;
	FreelancerInfo[] public freelancers;
	mapping (address => FreelancerInfo) public freelancerInfoMapping;

	function createContract(
		string memory name,
		string memory description,
		string memory tokenName,
		string memory tokenSymbol,
		uint256 numberOfShares,
		uint256 stakeAmount,
		address _disputeAdmin
	) public payable {
		require(msg.value == stakeAmount, "Insufficient Stake Amount");
		require(
			numberOfShares <= MAX_HOURS && numberOfShares >= MIN_HOURS,
			"Invalid number of shares. Should be within 24 and 720 hours"
		);
		uint256 hourlyRateForCurve = (numberOfShares * 1 ether * 1 ether) / stakeAmount;
		// uint256 hourlyRate = (stakeAmount * 1 ether) / numberOfShares;
		StakingContract stakingContract = new StakingContract(
			_disputeAdmin,
			numberOfShares,
			hourlyRateForCurve,
			tokenName,
			tokenSymbol
		);
		// Transfer the stake amount to the staking contract

		(bool success, ) = payable(address(stakingContract)).call{
			value: msg.value
		}("");
		require(success, "Stake transfer failed");
		freelancers.push(
			FreelancerInfo(
				idCounter++,
				name,
				description,
				address(stakingContract),
				msg.sender
			)
		);
		freelancerInfoMapping[msg.sender] = freelancers[freelancers.length - 1];
	}

	function getFreelancers() public view returns (FreelancerInfo[] memory) {
		return freelancers;
	}

	receive() external payable {}
}
