import React from "react";
import { toast } from "sonner";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";
import { buttonConfig } from "~~/types";

export const StartTask = ({ taskId, contractAddress }: buttonConfig) => {
  const {
    write: startTask,
    isError,
    isSuccess,
    isLoading,
  } = useContractWrite({
    abi: STAKING_CONTRACT_ABI,
    address: contractAddress as `0x${string}`,
    functionName: "startTask",
  });

  if (isError) {
    toast.error("Error starting task");
  }

  if (isSuccess) {
    toast.success("Task started successfully");
  }

  return (
    <>
      <Button
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => {
          startTask({ args: [BigInt(taskId)] });
        }}
        disabled={isLoading}
      >
        {isLoading ? "Starting..." : "Start Task"}
      </Button>
    </>
  );
};
