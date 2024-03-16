import React from "react";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";

export const SellButton = () => {
  const { write: sell } = useContractWrite({
    abi: STAKING_CONTRACT_ABI,
    address: "0x1234567890123456789012345678901234567890",
    functionName: "sellShares",
  });

  return (
    <>
      <Button
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={() => {
          sell({ args: [BigInt(1)] });
        }}
      >
        Sell
      </Button>
    </>
  );
};
