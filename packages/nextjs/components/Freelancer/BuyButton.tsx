import React from "react";
import { toast } from "sonner";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";

export const BuyButton = ({
  contractAddress,
  shares,
  price,
}: {
  contractAddress: string;
  shares: bigint;
  price: bigint;
}) => {
  const {
    write: buy,
    isError,
    isSuccess,
    isLoading,
  } = useContractWrite({
    abi: STAKING_CONTRACT_ABI,
    address: contractAddress,
    functionName: "buyShares",
  });

  if (isError) {
    toast.error("Error buying shares");
  }

  if (isSuccess && !isLoading) {
    toast.success("Shares brought successfully");
  }

  return (
    <>
      <Button
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => {
          buy({ args: [shares], value: price });
        }}
        disabled={isLoading}
      >
        {isLoading ? "Buying..." : "Buy"}
      </Button>
    </>
  );
};
