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
    watch: true,
  }) as { data: FreelancerInfo[] | undefined };

  //   const {} = useContractWrite({
  //     address: process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`,
  //     abi: CONTRACT_FACTORY_ABI,
  //     functionName: "createContract",
  //     args: [
  //       "Freelancer 2",
  //       "Freelancer 2 description",
  //       "Freelancer 2 Token",
  //       "F2T",
  //       700,
  //       10 * 10 ** 18,
  //       "0x5fbdb2315678afecb367f032d93f642f64180aa3",
  //       10 * 10 ** 18,
  //     ],
  //   });

  return {
    freelancersData,
  };
};

export default useFreelancerFactory;
