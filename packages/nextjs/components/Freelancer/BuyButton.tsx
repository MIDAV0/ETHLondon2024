import React from "react";
import { Button } from "~~/components/ui/button";

import { useContractWrite } from "wagmi";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";

export const BuyButton = () => {

  const { write: buy } = useContractWrite({
    abi: STAKING_CONTRACT_ABI,
    address: "0x1234567890123456789012345678901234567890",
    functionName: "buyShares"
  });

  return (
    <>
      <Button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => {
        buy({ args: [BigInt(1)] });
      }}>Buy</Button>
    </>
  );
};
