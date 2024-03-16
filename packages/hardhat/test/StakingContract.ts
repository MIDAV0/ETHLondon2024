import { expect } from "chai";
import { ethers, HardhatEthersSigner } from "hardhat";
import { ContractFactory, StakingContract, ERC20Token } from "../typechain-types";

describe("StakingContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let contractFactory: ContractFactory;
  let stakingContract: StakingContract;
  let erc20Token: ERC20Token;

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
    const numberOfShares = 200;
    const stakeAmount = BigInt(10 ** 18);
    await contractFactory
      .connect(freelancer)
      .createContract(
        name,
        description,
        tokenName,
        tokenSymbol,
        BigInt(numberOfShares * 10 ** 18),
        stakeAmount,
        disputeAdmin.address,
        {
          value: BigInt(10 ** 18),
        },
      );

    const stakingContractAddress = await contractFactory.freelancers(0);
    const stakingContractFactory = await ethers.getContractFactory("StakingContract");
    stakingContract = (await stakingContractFactory.attach(stakingContractAddress[3])) as StakingContract;

    await stakingContract.connect(buyer).getSomeShares(BigInt(10 * 10 ** 18));

    const erc20TokenFactory = await ethers.getContractFactory("ERC20Token");
    const erc20TokenAddress = await stakingContract.erc20TokenAddress();
    erc20Token = (await erc20TokenFactory.attach(erc20TokenAddress)) as ERC20Token;
  });

  describe("Deployment", function () {
    it("Should check the correct deployment info", async function () {
      expect(await stakingContract.frelancerStake()).to.equal(BigInt(10 ** 18));
      expect(await stakingContract.disputeAdmin()).to.equal(disputeAdmin.address);
    });
  });

  describe("createContract", function () {
    it("Should create a new task", async function () {
      await erc20Token.connect(buyer).approve(await stakingContract.getAddress(), BigInt(5 * 10 ** 18));
      await stakingContract.connect(buyer).createTask(1 * 24 * 3600, BigInt(5 * 10 ** 18), { value: BigInt(10 ** 18) });
      const task1 = await stakingContract.tasks(1);
      expect(task1[0]).to.equal(1);
      expect(task1[1]).to.equal(0);
      expect(task1[2]).to.equal(1 * 24 * 3600 + 1 * 24 * 3600);
      expect(task1[3]).to.equal(BigInt(5 * 10 ** 18));
      expect(task1[4]).to.equal(BigInt(10 ** 18));
    });
  });
});