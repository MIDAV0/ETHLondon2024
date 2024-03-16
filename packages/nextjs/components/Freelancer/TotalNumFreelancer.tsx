"use client";

import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

export const TotalNumFreelancer = () => {
  const { data: totalnumber, isFetching } = useScaffoldContractRead({
    contractName: "ContractFactory",
    functionName: "getFreelancerCount",
  });

  return (
    <div className="w-[200px]">
      No. of Freelancers:
      {isFetching ? <div>Loading....</div> : <div>{totalnumber?.toString()}</div>}
    </div>
  );
};
