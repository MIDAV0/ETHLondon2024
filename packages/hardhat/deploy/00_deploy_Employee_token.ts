import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const ContractFactoryContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const employeeContract = await deploy("ContractFactory", {
    from: deployer,
    args: [],
    log: true,
  });

  if (employeeContract.newlyDeployed) {
    console.log("Employee contract deployed at:", employeeContract.address);
  }
};

ContractFactoryContract.tags = ["all", "ContractFactory"];
export default ContractFactoryContract;
