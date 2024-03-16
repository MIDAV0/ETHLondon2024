//SPDX-License-Identifier: Unlic ense
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./EmployeeToken.sol";

contract StakingContract is Ownable {
	/// @dev Validation period for the client to confirm the work delivered by the freelancer
	uint256 public constant VALIDATION_PERIOD = 3 days;
	/// @dev Buffer period for the freelancer to deliver the work. Adds to the deadline
	uint256 public constant BUFFER_PERIOD = 1 days;

	uint256 public hourlyRate;

	uint256 public freelancerStake;

	address public disputeAdmin;

	uint256 public sharesSupply;

	event Trade(
		address trader,
		address subject,
		bool isBuy,
		uint256 shareAmount,
		uint256 ethAmount,
		uint256 supply
	);

	enum TaskStatus {
		NOT_STARTED,
		IN_PROGRESS,
		CANCELED,
		WORK_DELIVERED,
		WORK_VALIDATED,
		WORK_COMPLETED
	}

	struct Task {
		uint256 id;
		uint256 startTime;
		uint256 duration;
		uint256 shares;
		uint256 stakeAmount;
		TaskStatus status;
		address client;
		string title;
		string description;
	}

	struct Dispute {
		uint256 createdAt;
		bool isResolved;
	}

	modifier taskExists(uint256 taskId) {
		require(tasks[taskId].id != 0, "Task does not exist");
		_;
	}

	mapping(uint256 => Task) public tasks;
	uint256 public taskCounter;
	mapping(uint256 => Dispute) public disputes;

	EmployeeToken public _EmployeeToken;
	address public erc20TokenAddress;

	constructor(
		address _disputeAdmin, // address of the dispute admin
		uint256 initialSupplyOfShares,
		uint256 _hourlyRate,
		string memory name,
		string memory symbol
	) {
		_transferOwnership(tx.origin);
		disputeAdmin = _disputeAdmin;
		// Calculate t
		_EmployeeToken = new EmployeeToken(
			address(this),
			name,
			symbol,
			initialSupplyOfShares * 1 ether
		);
		erc20TokenAddress = address(_EmployeeToken);
		hourlyRate = _hourlyRate;
		buyShares(1 ether);
	}

	/// @dev Function to create task for the freelancer. Client also has to stake some amount of ETH equal to the shares value.
	/// @param duration The duration of the task in hours
	/// @param _shares The amount of shares the client wants to stake.
	function createTask(
		uint256 duration,
		uint256 _shares,
		string memory title,
		string memory description
	) public payable {
		// Check that frelancer's stake is more or equal to 1 share value
		uint256 sharesPrice = getBuyPrice(_shares);
		require(
			freelancerStake >= sharesPrice,
			"Freelancer's stake is less than 1 share value"
		);
		require(
			msg.value == sharesPrice,
			"Client stake is not equal to the shares value"
		);
		require(
			_EmployeeToken.balanceOf(msg.sender) >= _shares,
			"Insufficient shares"
		);

		taskCounter++;

		tasks[taskCounter] = Task({
			id: taskCounter,
			startTime: 0,
			duration: duration + BUFFER_PERIOD,
			shares: _shares,
			stakeAmount: sharesPrice,
			status: TaskStatus.NOT_STARTED,
			client: msg.sender,
			title: title,
			description: description
		});

		// Client transfers the int amount of shares to the contract
		_EmployeeToken.transferFrom(
			msg.sender,
			address(this),
			tasks[taskCounter].shares
		);
	}

	/// @dev Function to start the task. Called by the freelancer
	function startTask(uint256 taskId) public taskExists(taskId) onlyOwner {
		require(
			tasks[taskId].status == TaskStatus.NOT_STARTED,
			"Task already started or canceled"
		);

		tasks[taskId].startTime = block.timestamp;
		tasks[taskId].status = TaskStatus.IN_PROGRESS;
	}

	function cancelTask(uint256 taskId) public taskExists(taskId) {
		require(
			tasks[taskId].client == msg.sender,
			"You are not the client of this task"
		);
		require(
			tasks[taskId].status == TaskStatus.NOT_STARTED,
			"Task already started"
		);

		// Send the client's stake back
		(bool success, ) = tasks[taskId].client.call{
			value: tasks[taskId].stakeAmount
		}("");
		require(success, "Failed to send the stake amount to the client");

		// Release the clien's shares
		_EmployeeToken.transfer(tasks[taskId].client, tasks[taskId].shares);

		tasks[taskId].status = TaskStatus.CANCELED;
	}

	/// @dev Function to slash the freelancer if they don't deliver the work on time
	function slashFreelancer(uint256 taskId) public taskExists(taskId) {
		// slash freelancer
		require(
			tasks[taskId].status == TaskStatus.IN_PROGRESS,
			"Can't slash freelancer because the task is not in progres"
		);
		require(
			tasks[taskId].startTime + tasks[taskId].duration < block.timestamp,
			"Task is not late yet"
		);
		require(
			tasks[taskId].client == msg.sender,
			"You are not the client of this task"
		);

		// slash freelancer. Send freelancer's stake to the client
		(bool success, ) = tasks[taskId].client.call{
			value: 2 * tasks[taskId].stakeAmount
		}("");
		require(success, "Failed to send the stake amount to the client");

		// Send locked shares to the client
		_EmployeeToken.transfer(tasks[taskId].client, tasks[taskId].shares);

		tasks[taskId].status = TaskStatus.WORK_COMPLETED;
	}

	/// @dev Function that freelancer calls when client takes too long to validate the work
	function slashClient(uint256 taskId) public taskExists(taskId) onlyOwner {
		require(
			tasks[taskId].status == TaskStatus.WORK_DELIVERED,
			"Task is not in the slashed client state"
		);
		require(
			tasks[taskId].startTime +
				tasks[taskId].duration +
				VALIDATION_PERIOD <
				block.timestamp,
			"Task validation is not late yet"
		);
		// Release the freelancer's payment
		_EmployeeToken.transfer(owner(), tasks[taskId].shares);

		// Where should we send the client's stake?

		tasks[taskId].status = TaskStatus.WORK_COMPLETED;
	}

	/// @dev Function that freelancer  calls to confirm that they have delivered the work
	/// @param taskId The id of the task
	function confirmWorkDeleveredFreelancer(
		uint256 taskId
	) public taskExists(taskId) onlyOwner {
		// confirm work delivered
		require(
			tasks[taskId].status == TaskStatus.IN_PROGRESS,
			"Work already delivered"
		);
		require(
			tasks[taskId].startTime + tasks[taskId].duration >= block.timestamp,
			"Task is overdue"
		);

		tasks[taskId].status = TaskStatus.WORK_DELIVERED;
	}

	/// @dev Function that client calls to confirm that they have received the work from freelancer
	function confirmWorkCompletedClient(
		uint256 taskId,
		bool delivered
	) public taskExists(taskId) {
		require(
			tasks[taskId].client == msg.sender,
			"You are not the client of this task"
		);
		require(
			tasks[taskId].status == TaskStatus.WORK_DELIVERED,
			"Work not delivered yet"
		);
		require(
			tasks[taskId].startTime +
				tasks[taskId].duration +
				VALIDATION_PERIOD >=
				block.timestamp,
			"Task is overdue for validation"
		);

		if (delivered) {
			tasks[taskId].status = TaskStatus.WORK_COMPLETED;
			// release the freelancer's payment
			_EmployeeToken.transfer(owner(), tasks[taskId].shares);

			(bool success, ) = tasks[taskId].client.call{
				value: tasks[taskId].stakeAmount
			}("");
			require(success, "Failed to send the stake amount to the client");
		} else {
			tasks[taskId].status = TaskStatus.WORK_VALIDATED;
			createDispute(taskId);
		}
	}

	function createDispute(uint256 taskId) internal {
		disputes[taskId] = Dispute({
			createdAt: block.timestamp,
			isResolved: false
		});
	}

	function resolveDispute(
		uint256 taskId,
		bool isClientRight
	) public taskExists(taskId) {
		require(disputes[taskId].isResolved, "Dispute already resolved");
		require(msg.sender == disputeAdmin, "You are not the dispute admin");

		if (isClientRight) {
			// Slash the freelancer and send the client's stake back
			freelancerStake -= tasks[taskId].stakeAmount;
			(bool success, ) = tasks[taskId].client.call{
				value: 2 * tasks[taskId].stakeAmount
			}("");
			require(success, "Failed to send the stake amount to the client");

			// Send locked shares to the client
			_EmployeeToken.transfer(tasks[taskId].client, tasks[taskId].shares);
		} else {
			// Release the freelancer's payment
			_EmployeeToken.transfer(owner(), tasks[taskId].shares);

			// Send the client's stake to the freelancer
			(bool success, ) = owner().call{ value: tasks[taskId].stakeAmount }(
				""
			);
			require(success, "Failed to send the stake amount to the client");
		}
		tasks[taskId].status = TaskStatus.WORK_COMPLETED;
		disputes[taskId].isResolved = true;
	}

	function getPrice(
		uint256 supply,
		uint256 amount
	) public view returns (uint256) {
		require(_EmployeeToken.totalSupply() >= supply, "Insufficient supply of shares");
		uint256 sum1 = supply == 0
			? 0
			: ((supply - 1 ether) * (supply) * (2 * (supply - 1 ether) + 1 ether)) / 6 ether;
		uint256 sum2 = supply == 0 && amount == 1 ether
			? 0
			: ((supply - 1 ether + amount) *
				(supply + amount) *
				(2 * (supply - 1 ether + amount) + 1 ether)) / 6 ether;
		uint256 summation = sum2 - sum1;
		return summation / (hourlyRate * 10);
	}

	function getBuyPrice(
		uint256 amount
	) public view returns (uint256) {
		return getPrice(sharesSupply, amount);
	}

	function getSellPrice(
		uint256 amount
	) public view returns (uint256) {
		return getPrice(sharesSupply - amount, amount);
	}

	function buyShares(uint256 amount) public payable {
		uint256 supply = sharesSupply;
		// require(
		// 	supply > 0 || sharesSubject == address(this),
		// 	"Only the shares' subject can buy the first share"
		// );
		uint256 price = getPrice(supply, amount);
		require(msg.value >= price, "Insufficient payment");
		sharesSupply = supply + amount;
		emit Trade(
			msg.sender,
			address(this),
			true,
			amount,
			price,
			supply + amount
		);
		_EmployeeToken.transfer(msg.sender, amount);
	}

	function sellShares(uint256 amount) public payable {
		uint256 supply = sharesSupply;
		require(supply > amount, "Cannot sell the last share");
		uint256 price = getPrice(supply - amount, amount);
		require(_EmployeeToken.balanceOf(msg.sender) >= amount, "Insufficient shares");
		sharesSupply = supply - amount;
		emit Trade(
			msg.sender,
			address(this),
			false,
			amount,
			price,
			supply - amount
		);
		(bool sent, ) = payable(msg.sender).call{ value: price }("");
		_EmployeeToken.transferFrom(msg.sender, address(this), amount);
		require(sent, "Failed to send Ether");
	}

	receive() external payable {
		if (tx.origin == owner()) {
			freelancerStake += msg.value;
		}
	}
}
