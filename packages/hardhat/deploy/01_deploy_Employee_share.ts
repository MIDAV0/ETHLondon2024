import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const EmployeeShareContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const EmployeeToken = await deployments.get("EmployeeToken");

  const employeeContract = await deploy("EmployeeShares", {
    from: deployer,
    args: [EmployeeToken],
    log: true,
  });

  if (employeeContract.newlyDeployed) {
    console.log("Employee contract deployed at:", employeeContract.address);
  }
};

EmployeeShareContract.tags = ["all", "EmployeeShares"];
export default EmployeeShareContract;

