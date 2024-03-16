//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC20Token.sol";

contract StakingContract is Ownable {


   /// @dev Validation period for the client to confirm the work delivered by the freelancer
   uint256 public constant VALIDATION_PERIOD = 3 days;
   /// @dev Buffer period for the freelancer to deliver the work. Adds to the deadline
   uint256 public constant BUFFER_PERIOD = 1 days;

   uint256 public frelancerStake;

   address public disputeAdmin;

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
   }

   struct Dispute {
      uint256 createdAt;
      bool isResolved;
   }

   modifier taskExists(uint256 taskId) {
      require(tasks[taskId].id != 0, "Task does not exist");
      _;
   }

   mapping (uint256 => Task) public tasks;
   uint256 public taskCounter;
   mapping (uint256 => Dispute) public disputes;

   ERC20Token public _ERC20Token;

   constructor (
      address _disputeAdmin, // address of the dispute admin
      uint256 initialSupplyOfShares,
      string memory name,
      string memory symbol
   ) {
      _transferOwnership(msg.sender);
      disputeAdmin = _disputeAdmin;
      // Calculate t
      _ERC20Token = new ERC20Token(address(this), name, symbol, initialSupplyOfShares);
      // Add freelancers stake
   }


   /// @dev Function to create task for the freelancer. Client also has to stake some amount of ETH equal to the shares value.
   function createTask(uint256 duration, uint256 _shares) payable public {
      // Check that frelancer's stake is more or equal to 1 share value
      require(frelancerStake >= 1, "Freelancer's stake is less than 1 share value");
      require(msg.value == 1, "Client stake is not equal to the shares value");

      taskCounter++;

      tasks[taskCounter] = Task({
         id: taskCounter,
         startTime: 0,
         duration: duration + BUFFER_PERIOD,
         shares: _shares,
         stakeAmount: 1,
         status: TaskStatus.NOT_STARTED,
         client: msg.sender
      });

      // Client transfers the int amount of shares to the contract
      _ERC20Token.transferFrom(msg.sender, address(this), tasks[taskCounter].shares);

   }

   /// @dev Function to start the task. Called by the freelancer
   function startTask(uint256 taskId) public taskExists(taskId) onlyOwner() {
      require(tasks[taskId].status == TaskStatus.NOT_STARTED, "Task already started or canceled");

      tasks[taskId].startTime = block.timestamp;
      tasks[taskId].status = TaskStatus.IN_PROGRESS;
   }

   function cancelTask(uint256 taskId) public taskExists(taskId) {
      require(tasks[taskId].client == msg.sender, "You are not the client of this task");
      require(tasks[taskId].status == TaskStatus.NOT_STARTED, "Task already started");

      // Send the client's stake back
      (bool success, ) = tasks[taskId].client.call{value: tasks[taskId].stakeAmount}("");
      require(success, "Failed to send the stake amount to the client");

      // Release the clien's shares
      _ERC20Token.transfer(tasks[taskId].client, tasks[taskId].shares);

      tasks[taskId].status = TaskStatus.CANCELED;
   }

   /// @dev Function to slash the freelancer if they don't deliver the work on time
   function slashFreelancer(uint256 taskId) public taskExists(taskId) {
      // slash freelancer
      require(tasks[taskId].status == TaskStatus.IN_PROGRESS, "Can't slash freelancer because the task is not in progres");
      require(tasks[taskId].startTime + tasks[taskId].duration < block.timestamp, "Task is not late yet");
      require(tasks[taskId].client == msg.sender, "You are not the client of this task");

      // slash freelancer. Send freelancer's stake to the client
      (bool success, ) = tasks[taskId].client.call{value: 2*tasks[taskId].stakeAmount}("");
      require(success, "Failed to send the stake amount to the client");

      // Send locked shares to the client
      _ERC20Token.transfer(tasks[taskId].client, tasks[taskId].shares);

      tasks[taskId].status = TaskStatus.WORK_COMPLETED;
   }

   /// @dev Function that freelancer calls when client takes too long to validate the work
   function slashClient(uint256 taskId) public taskExists(taskId) onlyOwner() {
      require(tasks[taskId].status == TaskStatus.WORK_DELIVERED, "Task is not in the slashed client state");
      require(tasks[taskId].startTime + tasks[taskId].duration + VALIDATION_PERIOD < block.timestamp, "Task validation is not late yet");
      // Release the freelancer's payment
      _ERC20Token.transfer(owner(), tasks[taskId].shares);
      
      // Where should we send the client's stake?

      tasks[taskId].status = TaskStatus.WORK_COMPLETED;
   }

   /// @dev Function that freelancer  calls to confirm that they have delivered the work
   /// @param taskId The id of the task
   function confirmWorkDeleveredFreelancer(uint256 taskId) public taskExists(taskId) onlyOwner() {
      // confirm work delivered
      require(tasks[taskId].status == TaskStatus.IN_PROGRESS, "Work already delivered");
      require(tasks[taskId].startTime + tasks[taskId].duration >= block.timestamp, "Task is overdue");

      tasks[taskId].status = TaskStatus.WORK_DELIVERED;
   }

   /// @dev Function that client calls to confirm that they have received the work from freelancer
   function confirmWorkCompletedClient(uint256 taskId, bool delivered) public taskExists(taskId) {
      require(tasks[taskId].client == msg.sender, "You are not the client of this task");
      require(tasks[taskId].status == TaskStatus.WORK_DELIVERED, "Work not delivered yet");
      require(tasks[taskId].startTime + tasks[taskId].duration + VALIDATION_PERIOD >= block.timestamp, "Task is overdue for validation");

      if (delivered) {
         tasks[taskId].status = TaskStatus.WORK_COMPLETED;
         // release the freelancer's payment
         _ERC20Token.transfer(owner(), tasks[taskId].shares);
         
         (bool success, ) = tasks[taskId].client.call{value: tasks[taskId].stakeAmount}("");
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

   function resolveDispute(uint256 taskId, bool isClientRight) public taskExists(taskId) {
      require(disputes[taskId].isResolved, "Dispute already resolved");
      require(msg.sender == disputeAdmin, "You are not the dispute admin");

      if (isClientRight) {
         // Slash the freelancer and send the client's stake back
         frelancerStake -= tasks[taskId].stakeAmount;
         (bool success, ) = tasks[taskId].client.call{value: 2*tasks[taskId].stakeAmount}("");
         require(success, "Failed to send the stake amount to the client");

         // Send locked shares to the client
         _ERC20Token.transfer(tasks[taskId].client, tasks[taskId].shares);
      } else {
         // Release the freelancer's payment
         _ERC20Token.transfer(owner(), tasks[taskId].shares);
         
         // Send the client's stake to the freelancer
         (bool success, ) = owner().call{value: tasks[taskId].stakeAmount}("");
         require(success, "Failed to send the stake amount to the client");
      }
      tasks[taskId].status = TaskStatus.WORK_COMPLETED;
      disputes[taskId].isResolved = true;
   }


   receive() external payable {}
}