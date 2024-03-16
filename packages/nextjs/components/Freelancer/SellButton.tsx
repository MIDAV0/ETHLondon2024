import React from "react";
import { toast } from "sonner";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";

export const SellButton = () => {
  const {
    write: sell,
    isError,
    isSuccess,
    isLoading,
  } = useContractWrite({
    abi: STAKING_CONTRACT_ABI,
    address: "0x1234567890123456789012345678901234567890",
    functionName: "sellShares",
  });

  if (isError) {
    toast.error("Error selling shares");
  }

  if (isSuccess) {
    toast.success("Shares sold successfully");
  }

  return (
    <>
      <Button
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => {
          sell({ args: [BigInt(1)] });
        }}
      >
        {isLoading ? "Selling..." : "Sell"}
      </Button>
    </>
  );
};
