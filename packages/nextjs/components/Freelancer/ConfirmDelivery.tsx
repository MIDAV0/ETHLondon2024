import React from "react";
import { toast } from "sonner";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";
import { buttonConfig } from "~~/types";

export const ConfirmDelivery = ({ taskId, contractAddress }: buttonConfig) => {
  const {
    write: confirmDelivery,
    isError,
    isSuccess,
    isLoading,
  } = useContractWrite({
    abi: STAKING_CONTRACT_ABI,
    address: contractAddress as `0x${string}`,
    functionName: "confirmWorkDeleveredFreelancer",
  });

  if (isError) {
    toast.error("Error confirming");
  }

  if (isSuccess) {
    toast.success("Confirming successfully");
  }

  return (
    <>
      <Button
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => {
          confirmDelivery({ args: [BigInt(taskId)] });
        }}
        disabled={isLoading}
      >
        {isLoading ? "Confirming..." : "Confirm Delivery"}
      </Button>
    </>
  );
};
