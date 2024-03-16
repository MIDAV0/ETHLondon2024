"use client";

import { useContractRead } from "wagmi";
import { CONTRACT_FACTORY_ABI } from "~~/contracts/ContractFactory";

type FreelancerInfo = {
  id: number;
  name: string;
  description: string;
  stakingContractAddress: string;
  owner: string;
};

export const useFreelancerFactory = () => {
  const { data: freelancersData } = useContractRead({
    address: "0xfbeD2EF163dAC5EEbee187051E352Bbee135c8C2",
    abi: CONTRACT_FACTORY_ABI,
    functionName: "getFreelancers",
    watch: true,
  }) as { data: FreelancerInfo[] | undefined };

  return {
    freelancersData,
  };
};
export default useFreelancerFactory;
