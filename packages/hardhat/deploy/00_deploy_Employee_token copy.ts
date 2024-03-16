import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const EmployeeTokenContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const employeeContract = await deploy("EmployeeToken", {
    from: deployer,
    args: [1_000_000_000],
    log: true,
  });

  if (employeeContract.newlyDeployed) {
    console.log("Employee contract deployed at:", employeeContract.address);
  }
};

EmployeeTokenContract.tags = ["all", "EmployeeShares"];
export default EmployeeTokenContract;
