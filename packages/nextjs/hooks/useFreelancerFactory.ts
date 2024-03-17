"use client";

import { useContractRead } from "wagmi";
import { CONTRACT_FACTORY_ABI } from "~~/contracts/ContractFactory";
import chainSmart from "~~/utils/chainSmart";

type FreelancerInfo = {
  id: number;
  name: string;
  description: string;
  stakingContractAddress: string;
  owner: string;
};

export const useFreelancerFactory = (chainid: number) => {
  console.log("chainid", chainid);
  const smartContract = chainSmart(chainid);
  console.log("smartContract", smartContract);
  const { data: freelancersData } = useContractRead({
    address: smartContract,
    abi: CONTRACT_FACTORY_ABI,
    functionName: "getFreelancers",
    watch: true,
  }) as { data: FreelancerInfo[] | undefined };

  return {
    freelancersData,
  };
};
export default useFreelancerFactory;
