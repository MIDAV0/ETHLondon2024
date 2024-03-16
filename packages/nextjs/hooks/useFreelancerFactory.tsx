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
    address: process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`,
    abi: CONTRACT_FACTORY_ABI,
    functionName: "freelansers",
  }) as { data: FreelancerInfo[] | undefined };

  return {
    freelancersData,
  };
};

export default useFreelancerFactory;
