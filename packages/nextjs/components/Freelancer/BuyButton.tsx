import React from "react";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";
import { toast } from "sonner"


export const BuyButton = () => {
  const { write: buy, isError, isSuccess, isLoading } = useContractWrite({
    abi: STAKING_CONTRACT_ABI,
    address: "0x1234567890123456789012345678901234567890",
    functionName: "buyShares",
  });

  if (isError) {
    toast.error("Error buying shares");
  }

  if (isSuccess) {
    toast.success("Shares brought successfully");
  }


  return (
    <>
      <Button
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => {
          buy({ args: [BigInt(1)] });
        }}
        disabled={isLoading}
      >
        {isLoading ? "Buying..." : "Buy"}
      </Button>
    </>
  );
};
