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
      expect(await contractFactory.freelancers.length).to.equal(0);
    });
  });

  describe("createContract", function () {
    it("Should create a new contract", async function () {
      const name = "Freelancer 1";
      const description = "Freelancer 1 description";
      const tokenName = "Freelancer 1 Token";
      const tokenSymbol = "F1T";
      const numberOfShares = 50;
      const stakeAmount = BigInt(10 ** 18);
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
            value: BigInt(10 ** 18),
          },
        );
    });

    it("Should create second freelancer", async function () {
      const name = "Freelancer 2";
      const description = "Freelancer 2 description";
      const tokenName = "Freelancer 2 Token";
      const tokenSymbol = "F2T";
      const numberOfShares = 100;
      const stakeAmount = BigInt(10 ** 18);
      await contractFactory
        .connect(freelancer2)
        .createContract(
          name,
          description,
          tokenName,
          tokenSymbol,
          BigInt(numberOfShares),
          stakeAmount,
          disputeAdmin.address,
          {
            value: BigInt(10 ** 18),
          },
        );
    });
    it("Should log the freelancers", async function () {
      const freelancers = await contractFactory.getFreelancers();
      console.log(freelancers[0]);
    });
  });
});
