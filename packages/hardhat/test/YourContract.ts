import { expect } from "chai";
import { ethers } from "hardhat";
import { EmployeeToken, EmployeeShares } from "../typechain-types";


describe("EmployeeShares", function () {
  let MockEmployeeToken, mockEmployeeToken;
  let EmployeeShares, employeeShares;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy MockEmployeeToken
    MockEmployeeToken = await ethers.getContractFactory("MockEmployeeToken");
    mockEmployeeToken = await MockEmployeeToken.deploy();
    await mockEmployeeToken.deployed();

    // Deploy EmployeeShares with the address of the deployed MockEmployeeToken
    EmployeeShares = await ethers.getContractFactory("EmployeeShares");
    employeeShares = await EmployeeShares.deploy(mockEmployeeToken.address);
    await employeeShares.deployed();
  });

  it("Should allow buying shares and emit Trade event", async function () {
    const sharesSubject = addr1.address;
    const buyAmount = 5;
    const buyPrice = await employeeShares.getBuyPrice(sharesSubject, buyAmount);

    await expect(employeeShares.connect(addr2).buyShares(sharesSubject, buyAmount, { value: buyPrice }))
      .to.emit(employeeShares, "Trade")
      .withArgs(addr2.address, sharesSubject, true, buyAmount, buyPrice, buyAmount);

    const balance = await employeeShares.sharesBalance(sharesSubject, addr2.address);
    expect(balance).to.equal(buyAmount);
  });

  it("Should allow selling shares and emit Trade event", async function () {
    // Ensure addr1 buys some shares before attempting to sell
    const sharesSubject = addr1.address;
    const buyAmount = 5;
    const buyPrice = await employeeShares.getBuyPrice(sharesSubject, buyAmount);
    await employeeShares.connect(addr1).buyShares(sharesSubject, buyAmount, { value: buyPrice });

    const sellAmount = 3;
    const sellPrice = await employeeShares.getSellPrice(sharesSubject, sellAmount);

    await expect(employeeShares.connect(addr1).sellShares(sharesSubject, sellAmount))
      .to.emit(employeeShares, "Trade")
      .withArgs(addr1.address, sharesSubject, false, sellAmount, sellPrice, buyAmount - sellAmount);

    const balanceAfterSale = await employeeShares.sharesBalance(sharesSubject, addr1.address);
    expect(balanceAfterSale).to.equal(buyAmount - sellAmount);
  });

  it("Should revert on insufficient payment for buying shares", async function () {
    const sharesSubject = addr1.address;
    const buyAmount = 5;
    const insufficientPayment = ethers.utils.parseEther("0.01");

    await expect(
      employeeShares.connect(addr2).buyShares(sharesSubject, buyAmount, { value: insufficientPayment }),
    ).to.be.revertedWith("Insufficient payment");
  });

  it("Should revert when trying to sell more shares than owned", async function () {
    const sharesSubject = addr1.address;
    const sellAmount = 5; // Assume addr1 has not bought any shares yet

    await expect(employeeShares.connect(addr1).sellShares(sharesSubject, sellAmount)).to.be.revertedWith(
      "Insufficient shares",
    );
  });
});
