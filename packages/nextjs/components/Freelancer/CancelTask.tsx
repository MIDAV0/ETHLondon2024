import React from "react";
import { toast } from "sonner";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";
import { buttonConfig } from "~~/types";

export const CancelTask = ({ taskId, contractAddress }: buttonConfig) => {
  const {
    write: cancelTask,
    isError,
    isSuccess,
    isLoading,
  } = useContractWrite({
    abi: STAKING_CONTRACT_ABI,
    address: contractAddress as `0x${string}`,
    functionName: "cancelTask",
  });

  if (isError) {
    toast.error("Error cancelling task");
  }

  if (isSuccess) {
    toast.success("Task cancelled successfully");
  }

  return (
    <>
      <Button
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => {
          cancelTask({ args: [BigInt(taskId)] });
        }}
        disabled={isLoading}
      >
        {isLoading ? "Cancelling..." : "Cancel Task"}
      </Button>
    </>
  );
};
