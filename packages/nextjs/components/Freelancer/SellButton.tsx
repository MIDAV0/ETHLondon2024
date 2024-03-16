import React from "react";
import { toast } from "sonner";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";

export const SellButton = ({ contractAddress }: { contractAddress: string }) => {
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

  if (isSuccess) {
    toast.success("Shares sold successfully");
  }

  return (
    <>
      <Button
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => {
          sell({ args: [BigInt(10 ** 18)] });
        }}
      >
        {isLoading ? "Selling..." : "Sell"}
      </Button>
    </>
  );
};
