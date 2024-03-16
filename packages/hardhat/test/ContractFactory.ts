import { expect } from "chai";
import { ethers, HardhatEthersSigner } from "hardhat";
import { ContractFactory } from "../typechain-types";

describe("ContractFactory", function () {
  // We define a fixture to reuse the same setup in every test.

  let contractFactory: ContractFactory;

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
  });

  describe("Deployment", function () {
    it("Should have correct counter on deploy", async function () {
      expect(await contractFactory.getFreelancerCount()).to.equal(0);
    });
  });

  describe("createContract", function () {
    it("Should create a new contract", async function () {
      const name = "Freelancer 1";
      const description = "Freelancer 1 description";
      const tokenName = "Freelancer 1 Token";
      const tokenSymbol = "F1T";
      const numberOfShares = 24;
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
      expect(await contractFactory.getFreelancerCount()).to.equal(1);
    });
  });
});
