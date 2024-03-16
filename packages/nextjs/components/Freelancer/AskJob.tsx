import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { formatUnits, parseEther } from "viem";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~~/components/ui/sheet";
import { EMPLOYEE_TOKEN_ABI } from "~~/contracts/EmployeeToken";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";

export const AskJob = ({ contractAddress, tokenAddress }: { contractAddress: string; tokenAddress: string }) => {
  const [buyPrice, setBuyPrice] = useState(0);
  // Define states for Input values
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobDuration, setJobDuration] = useState(6);

  const { address } = useAccount();

  const {
    // data: writeData,
    // isLoading: isWriteLoading,
    // isSuccess: isWriteSuccess,
    write: writeCreateTask,
  } = useContractWrite({
    address: contractAddress,
    abi: STAKING_CONTRACT_ABI,
    functionName: "createTask",
  });

  const {
    // data: writeData,
    // isLoading: isWriteLoading,
    // isSuccess: isWriteSuccess,
    write: writeApproveTokens,
  } = useContractWrite({
    address: tokenAddress,
    abi: EMPLOYEE_TOKEN_ABI,
    functionName: "approve",
  });

  const { data: getAllowance } = useContractRead({
    address: tokenAddress,
    abi: EMPLOYEE_TOKEN_ABI,
    functionName: "allowance",
    watch: true, // This tells wagmi to re-fetch when changes are detected
    args: [address, contractAddress], // Pass jobPrice as an argument
    enabled: !!address,
  }) as { data: bigint | undefined };

  const { data: getBalanceOf } = useContractRead({
    address: tokenAddress,
    abi: EMPLOYEE_TOKEN_ABI,
    functionName: "balanceOf",
    watch: true, // This tells wagmi to re-fetch when changes are detected
    args: [address], // Pass jobPrice as an argument
    enabled: !!address,
  }) as { data: bigint | undefined };

  const { data: getPriceData } = useContractRead({
    address: contractAddress,
    abi: STAKING_CONTRACT_ABI,
    functionName: "getBuyPrice",
    watch: true, // This tells wagmi to re-fetch when changes are detected
    args: [parseEther(jobDuration.toString())], // Pass jobPrice as an argument
    enabled: jobDuration !== 0,
  }) as { data: bigint | undefined };

  useEffect(() => {
    if (getPriceData) {
      setBuyPrice(Number(formatUnits(getPriceData, 18))); // Make sure to convert the data to the appropriate type
    }
  }, [getPriceData]);

  const onSubmit = () => {
    writeCreateTask({
      args: [jobDuration * 3600, parseEther(jobDuration.toString()), jobTitle, jobDescription],
    });
  };

  const onApprove = () => {
    writeApproveTokens({
      args: [contractAddress, parseEther(jobDuration.toString())],
    });
  };

  return (
    <>
      <Sheet>
        <SheetTrigger>
          <Button className="bg-red-500 text-white p-2 rounded-md">Ask Job</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create a Job for</SheetTitle>
            <SheetDescription>Create a job for the freelancer to complete.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col space-y-4 mt-4">
            <Input type="text" placeholder="Job Title" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
            <Input
              type="text"
              placeholder="Job Description"
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Job Duration (hours)"
              value={jobDuration}
              onChange={e => setJobDuration(e.target.value)}
              min={6}
            />
            <div className="p-4 text-center rounded-lg border-2 border-dashed border-gray-300">
              You have {getBalanceOf ? formatUnits(getBalanceOf, 18) : 0} Shares
            </div>
            <div>
              Approve {jobDuration} Shares And Stake {buyPrice || 0} ETH To Create A Job
            </div>
            <Button
              onClick={() => {
                if ((getAllowance ? Number(formatUnits(getAllowance, 18)) : 0) < jobDuration) {
                  onApprove();
                } else {
                  onSubmit();
                }
              }}
              className="bg-blue-500 text-white p-2 rounded-md"
              disabled={(getBalanceOf ? Number(formatUnits(getBalanceOf, 18)) : 0) < jobDuration}
            >
              {(getAllowance ? Number(formatUnits(getAllowance, 18)) : 0) < jobDuration ? "Approve" : "Create Job"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
