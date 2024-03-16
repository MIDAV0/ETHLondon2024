import { expect } from "chai";
import { ethers, HardhatEthersSigner } from "hardhat";
import { ContractFactory, StakingContract, EmployeeToken } from "../typechain-types";

describe("StakingContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let contractFactory: ContractFactory;
  let stakingContract: StakingContract;
  let employeeToken: EmployeeToken;

  let owner: HardhatEthersSigner,
    freelancer: HardhatEthersSigner,
    buyer: HardhatEthersSigner,
    disputeAdmin: HardhatEthersSigner,
    freelancer2: HardhatEthersSigner;

  before(async () => {
    [owner, freelancer, buyer, disputeAdmin, freelancer2] = await ethers.getSigners();
    const contractFactoryFactory = await ethers.getContractFactory("ContractFactory");
    contractFactory = (await contractFactoryFactory.deploy()) as ContractFactory;
    await contractFactory.waitForDeployment();

    const name = "Freelancer 1";
    const description = "Freelancer 1 description";
    const tokenName = "Freelancer 1 Token";
    const tokenSymbol = "F1T";
    const numberOfShares = 700;
    const stakeAmount = BigInt(10 * 10 ** 18);
    await contractFactory
      .connect(freelancer)
      .createContract(
        name,
        description,
        tokenName,
        tokenSymbol,
        BigInt(numberOfShares),
        stakeAmount,
        disputeAdmin.address,
        {
          value: BigInt(10 * 10 ** 18),
        },
      );

    const stakingContractAddress = await contractFactory.freelancers(0);
    const stakingContractFactory = await ethers.getContractFactory("StakingContract");
    stakingContract = (await stakingContractFactory.attach(stakingContractAddress[3])) as StakingContract;

    // await stakingContract.connect(buyer).getSomeShares(BigInt(10 * 10 ** 18));

    const employeeTokenFactory = await ethers.getContractFactory("EmployeeToken");
    const employeeTokenAddress = await stakingContract.erc20TokenAddress();
    employeeToken = (await employeeTokenFactory.attach(employeeTokenAddress)) as EmployeeToken;
  });
  describe("Deployment", function () {
    it("Should check the correct deployment info", async function () {
      expect(await stakingContract.freelancerStake()).to.equal(BigInt(10 * 10 ** 18));
      expect(await stakingContract.disputeAdmin()).to.equal(disputeAdmin.address);
    });
    it("Should fetch the privce of the shares", async function () {
      console.log(await stakingContract.getBuyPrice(BigInt(1 * 10 ** 18)));
    });
  });

  describe("createContract", function () {
    it("Buyer should get some shares", async function () {
      const priceForShares = await stakingContract.getBuyPrice(BigInt(10 * 10 ** 18));
      await stakingContract.connect(buyer).buyShares(BigInt(10 * 10 ** 18), { value: priceForShares });

      const shares = await employeeToken.balanceOf(buyer.address);
      expect(shares).to.equal(BigInt(10 * 10 ** 18));
    });
    it("Should create a new task", async function () {
      const priceForShares = await stakingContract.getBuyPrice(BigInt(5 * 10 ** 18));
      await employeeToken.connect(buyer).approve(await stakingContract.getAddress(), BigInt(5 * 10 ** 18));
      await stakingContract.connect(buyer).createTask(1 * 24 * 3600, BigInt(5 * 10 ** 18), { value: priceForShares });
      const task1 = await stakingContract.tasks(1);
      expect(task1[0]).to.equal(1);
      expect(task1[1]).to.equal(0);
      expect(task1[2]).to.equal(1 * 24 * 3600 + 1 * 24 * 3600);
      expect(task1[3]).to.equal(BigInt(5 * 10 ** 18));
      expect(task1[4]).to.equal(priceForShares);
    });

    it("Should allow freelancer to start the task", async function () {
      await stakingContract.connect(freelancer).startTask(1);
      const task1 = await stakingContract.tasks(1);
      expect(task1[5]).to.equal(1);
    });

    it("Should revert if buyer tries to cancel the task that already started", async function () {
      await expect(stakingContract.connect(buyer).cancelTask(1)).to.be.revertedWith("Task already started");
    });

    it("Should allow freelancer to deliver the work", async function () {
      await stakingContract.connect(freelancer).confirmWorkDeleveredFreelancer(1);
      const task1 = await stakingContract.tasks(1);
      expect(task1[5]).to.equal(3);
    });

    it("Should allow buyer to confirm the work", async function () {
      const freelancerBalanceBefore = await employeeToken.balanceOf(freelancer.address);
      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);
      await stakingContract.connect(buyer).confirmWorkCompletedClient(1, true);
      const task1 = await stakingContract.tasks(1);
      expect(task1[5]).to.equal(5);
      const freelancerBalanceAfter = await employeeToken.balanceOf(freelancer.address);
      expect(freelancerBalanceAfter - freelancerBalanceBefore).to.equal(BigInt(5 * 10 ** 18));
      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
      expect(buyerBalanceAfter > buyerBalanceBefore).to.equal(true);
    });
  });
});
