import React from "react";
import { toast } from "sonner";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";
import { buttonConfig } from "~~/types";

export const SlashFreelancer = ({ taskId, contractAddress }: buttonConfig) => {
  const {
    write: slashFreelancer,
    isError,
    isSuccess,
    isLoading,
  } = useContractWrite({
    abi: STAKING_CONTRACT_ABI,
    address: contractAddress as `0x${string}`,
    functionName: "slashFreelancer",
  });

  if (isError) {
    toast.error("Error slashing");
  }

  if (isSuccess) {
    toast.success("Slashed successfully");
  }

  return (
    <>
      <Button
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => {
          slashFreelancer({ args: [BigInt(taskId)] });
        }}
        disabled={isLoading}
      >
        {isLoading ? "Slashing..." : "Slash Freelancer"}
      </Button>
    </>
  );
};
