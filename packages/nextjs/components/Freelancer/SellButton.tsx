import React from "react";
import { toast } from "sonner";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";

export const SellButton = ({
  contractAddress,
  shares,
  price,
}: {
  contractAddress: string;
  shares: bigint;
  price: bigint;
}) => {
  const {
    write: sell,
    isError,
    isSuccess,
    isLoading,
  } = useContractWrite({
    abi: STAKING_CONTRACT_ABI,
    address: "contractAddress",
    functionName: "sellShares",
  });

  if (isError) {
    toast.error("Error selling shares");
  }

  if (isSuccess && !isLoading) {
    toast.success("Shares sold successfully");
  }

  return (
    <>
      <Button
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => {
          sell({ args: [shares], value: price });
        }}
      >
        {isLoading ? "Selling..." : "Sell"}
      </Button>
    </>
  );
};
