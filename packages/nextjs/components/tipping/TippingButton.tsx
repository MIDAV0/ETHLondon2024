import React from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useContractWrite } from "wagmi";

export const TippingButton = () => {
  // const {
  //   write: tip,
  //   isError,
  //   isSuccess,
  //   isLoading,
  // } = useContractWrite({
  //   abi: [],
  //   address: "0x01e61008F78A83E0DaBd2FBd7ef81B64cdD2e1F4",
  //   functionName: "transfer",
  // });

  // if (isError) {
  //   toast.error("Error tipping");
  // }

  // const handleTip = () => {
  //   tip({ args: ["0x1234567890123456789012345678901234567890", BigInt(100)] });
  // };

  return <Button>Tipping</Button>;
};
