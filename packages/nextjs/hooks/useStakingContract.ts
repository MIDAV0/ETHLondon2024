import { formatUnits, parseEther } from "viem";
import { useContractRead } from "wagmi";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";

type TaskData = {
  id: number;
  startTime: number;
  duration: number;
  shares: number;
  stakeAmount: number;
  status: number;
  client: string;
};

export const useStakingContract = ({ contractAddress }: { contractAddress: string }) => {
  const { data: tasksData } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: STAKING_CONTRACT_ABI,
    functionName: "tasks",
    watch: true,
  }) as { data: TaskData[] | undefined };

  const { data: sharePrice } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: STAKING_CONTRACT_ABI,
    functionName: "getBuyPrice",
    args: [parseEther("1")],
  }) as { data: bigint };

  return {
    tasksData,
    sharePrice: sharePrice ? formatUnits(sharePrice, 18) : undefined,
  };
};

export default useStakingContract;
