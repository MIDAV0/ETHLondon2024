/*

 ██████  ██████   ██████  ██   ██ ██████   ██████   ██████  ██   ██    ██████  ███████ ██    ██
██      ██    ██ ██    ██ ██  ██  ██   ██ ██    ██ ██    ██ ██  ██     ██   ██ ██      ██    ██
██      ██    ██ ██    ██ █████   ██████  ██    ██ ██    ██ █████      ██   ██ █████   ██    ██
██      ██    ██ ██    ██ ██  ██  ██   ██ ██    ██ ██    ██ ██  ██     ██   ██ ██       ██  ██
 ██████  ██████   ██████  ██   ██ ██████   ██████   ██████  ██   ██ ██ ██████  ███████   ████

Find any smart contract, and build your project faster: https://www.cookbook.dev/?utm=code
Twitter: https://twitter.com/cookbook_dev
Discord: https://discord.gg/P96rgQE2xp

Find this contract on Cookbook: https://www.cookbook.dev/contracts/0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4-FriendtechSharesV1?utm=code
*/

// File: contracts/Context.sol

// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
	function _msgSender() internal view virtual returns (address) {
		return msg.sender;
	}

	function _msgData() internal view virtual returns (bytes calldata) {
		return msg.data;
	}
}

// File: contracts/Ownable.sol

// OpenZeppelin Contracts (last updated v4.7.0) (access/Ownable.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
	address private _owner;

	event OwnershipTransferred(
		address indexed previousOwner,
		address indexed newOwner
	);

	/**
	 * @dev Initializes the contract setting the deployer as the initial owner.
	 */
	constructor() {
		_transferOwnership(_msgSender());
	}

	/**
	 * @dev Throws if called by any account other than the owner.
	 */
	modifier onlyOwner() {
		_checkOwner();
		_;
	}

	/**
	 * @dev Returns the address of the current owner.
	 */
	function owner() public view virtual returns (address) {
		return _owner;
	}

	/**
	 * @dev Throws if the sender is not the owner.
	 */
	function _checkOwner() internal view virtual {
		require(owner() == _msgSender(), "Ownable: caller is not the owner");
	}

	/**
	 * @dev Leaves the contract without owner. It will not be possible to call
	 * `onlyOwner` functions anymore. Can only be called by the current owner.
	 *
	 * NOTE: Renouncing ownership will leave the contract without an owner,
	 * thereby removing any functionality that is only available to the owner.
	 */
	function renounceOwnership() public virtual onlyOwner {
		_transferOwnership(address(0));
	}

	/**
	 * @dev Transfers ownership of the contract to a new account (`newOwner`).
	 * Can only be called by the current owner.
	 */
	function transferOwnership(address newOwner) public virtual onlyOwner {
		require(
			newOwner != address(0),
			"Ownable: new owner is the zero address"
		);
		_transferOwnership(newOwner);
	}

	/**
	 * @dev Transfers ownership of the contract to a new account (`newOwner`).
	 * Internal function without access restriction.
	 */
	function _transferOwnership(address newOwner) internal virtual {
		address oldOwner = _owner;
		_owner = newOwner;
		emit OwnershipTransferred(oldOwner, newOwner);
	}
}

// File: contracts/FriendtechShares.sol

pragma solidity >=0.8.2 <0.9.0;

import "./interface/IEmployeeToken.sol";

contract EmployeeShares is Ownable {
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
