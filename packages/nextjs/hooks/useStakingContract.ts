import { useEffect, useState } from "react";
import { readContract } from "@wagmi/core";
import { formatUnits, parseEther } from "viem";
import { useAccount, useContractRead } from "wagmi";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";

type TaskData = {
  id: number;
  startTime: number;
  duration: number;
  shares: number;
  stakeAmount: number;
  status: number;
  client: string;
  title: string;
  description: string;
};

export const useStakingContract = ({ contractAddress }: { contractAddress: string }) => {
  const [tasksData, setTasksData] = useState<TaskData[]>([]);
  const [tasksForClient, setTasksForClient] = useState<TaskData[]>([]);
  const { address } = useAccount();

  const { data: currentTaskId } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: STAKING_CONTRACT_ABI,
    functionName: "taskCounter",
    watch: true,
  }) as { data: number };

  const loadTasksData = async () => {
    if (contractAddress === undefined || currentTaskId === 0) return;
    const result: Promise<TaskData>[] = [];
    for (let i = 1; i <= currentTaskId; i += 1) {
      const data = readContract({
        address: contractAddress as `0x${string}`,
        abi: STAKING_CONTRACT_ABI,
        functionName: "tasks",
        args: [i],
      }) as Promise<TaskData>;
      result.push(data);
    }
    setTasksData(await Promise.all(result));
  };

  const loadTasksForClient = async () => {
    if (contractAddress === undefined || currentTaskId === 0 || address === undefined) return;
    const result: Promise<TaskData>[] = [];
    for (let i = 1; i <= currentTaskId; i += 1) {
      const data = readContract({
        address: contractAddress as `0x${string}`,
        abi: STAKING_CONTRACT_ABI,
        functionName: "tasks",
        args: [i],
      }) as Promise<TaskData>;
      result.push(data);
    }
    const tasks = await Promise.all(result);
    setTasksForClient(tasks.filter(task => task.client === address));
  };

  const { data: tokenAddress } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: STAKING_CONTRACT_ABI,
    functionName: "erc20TokenAddress",
  }) as { data: string | undefined };

  const { data: sharePrice } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: STAKING_CONTRACT_ABI,
    functionName: "getBuyPrice",
    args: [parseEther("1")],
  }) as { data: bigint };

  useEffect(() => {
    loadTasksData();
    loadTasksForClient();
  }, [currentTaskId]);

  return {
    sharePrice: sharePrice ? formatUnits(sharePrice, 18) : undefined,
    tokenAddress,
    currentTaskId,
    tasksData,
    tasksForClient,
  };
};

export default useStakingContract;
