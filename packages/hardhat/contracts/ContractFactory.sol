//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0 <0.9.0;

import "./StakingContract.sol";

contract ContractFactory {

    uint256 constant public MIN_HOURS = 24;
    uint256 constant public MAX_HOURS = 720;

    struct FrelancerInfo {
        uint256 id;
        string name;
        string description;
        address stakingContractAddress;
        address owner;
    }

    uint256 public idCounter;
    FrelancerInfo[] public freelancers;

    function createContract(
        string memory name,
        string memory description,
        string memory tokenName,
        string memory tokenSymbol,
        // uint256 stakingAmount,
        uint256 numberOfShares,
        uint256 stakeAmount,
        address _disputeAdmin
    ) payable public {
        require(msg.value == stakeAmount, "Insufficient Stake Amount");
        require(numberOfShares <= MAX_HOURS && numberOfShares >= MIN_HOURS, "Invalid number of shares. Should be within 24 and 720 hours");
        StakingContract stakingContract = new StakingContract(
            _disputeAdmin,
            numberOfShares,
            tokenName,
            tokenSymbol
        );
        // Transfer the stake amount to the staking contract

        (bool success, ) = payable(address(stakingContract)).call{value: msg.value}("");
        require(success, "Stake transfer failed");
        freelancers.push(FrelancerInfo(idCounter++, name, description, address(stakingContract), msg.sender));
    }

    function getFreelancerCount() public view returns (uint) {
        return freelancers.length;
    }

    receive() external payable {}

}
