import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const EmployeeShareContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const employeeToken = await deployments.get("EmployeeToken");
  console.log("EmployeeToken address:", employeeToken.address);

  const employeeContract = await deploy("EmployeeShares", {
    from: deployer,
    args: [employeeToken.address],
    log: true,
  });

  if (employeeContract.newlyDeployed) {
    console.log("Employee contract deployed at:", employeeContract.address);
  }
};

EmployeeShareContract.tags = ["all", "EmployeeShares"];
export default EmployeeShareContract;
