"use client";

import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

export const TotalNumFreelancer = () => {
  const { data: totalnumber, isFetching } = useScaffoldContractRead({
    contractName: "ContractFactory",
    functionName: "getFreelancerCount",
  });

  if (isFetching) {
    return <div>loading...</div>;
  }

  return <div>Total Number: {totalnumber?.toString()}</div>;
};
