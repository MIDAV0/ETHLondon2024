import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useContractRead, useContractWrite } from "wagmi";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~~/components/ui/sheet";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";

export const AskJob = () => {
  const [buyPrice, setBuyPrice] = useState(0);
  // Define states for Input values
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobPrice, setJobPrice] = useState("");
  const [jobDeadline, setJobDeadline] = useState("");
  const contractAddress = "0xBfec823dF7352Cf08388877647c0E89A2b242F9D";

  const {
    data: writeData,
    isLoading: isWriteLoading,
    isSuccess: isWriteSuccess,
    write,
  } = useContractWrite({
    address: contractAddress,
    abi: STAKING_CONTRACT_ABI,
    functionName: "createTask",
  });

  const { data: getPriceData } = useContractRead({
    address: contractAddress,
    abi: STAKING_CONTRACT_ABI,
    functionName: "getBuyPrice",
    watch: true, // This tells wagmi to re-fetch when changes are detected
    args: [jobPrice], // Pass jobPrice as an argument
    enabled: jobPrice !== "",
  });

  useEffect(() => {
    if (getPriceData) {
      setBuyPrice(Number(getPriceData)); // Make sure to convert the data to the appropriate type
    }
  }, [getPriceData]);

  const onSubmit = (values: any) => {
    write({
      args: [jobPrice, jobDeadline],
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
            <Input type="text" placeholder="Job Price" value={jobPrice} onChange={e => setJobPrice(e.target.value)} />
            <Input
              type="text"
              placeholder="Job Deadline"
              value={jobDeadline}
              onChange={e => setJobDeadline(e.target.value)}
            />
            <Button onClick={onSubmit} className="bg-blue-500 text-white p-2 rounded-md">
              Create Job
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
