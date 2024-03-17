import React from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useContractWrite } from "wagmi";
import APEToken from "~~/contracts/APEToken.json";

export const TippingButton = ({ contractAddress }: { contractAddress: string }) => {
  const {
    write: tip,
    isError,
    isSuccess,
    isLoading,
  } = useContractWrite({
    abi: APEToken.abi,
    address: "0x01e61008F78A83E0DaBd2FBd7ef81B64cdD2e1F4",
    functionName: "transfer",
  });

  if (isError) {
    toast.error("Error tipping");
  }

  const handleTip = () => {
    tip({ args: [contractAddress, BigInt(100)] });
  };

  return <Button onClick={handleTip}>Tipping</Button>;
};
