import React from "react";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";
import { toast } from "sonner"


export const SlashFreelancer = (taskId: number) => {
    const { write: slashFreelancer, isError, isSuccess, isLoading } = useContractWrite({
        abi: STAKING_CONTRACT_ABI,
        address: "0x1234567890123456789012345678901234567890",
        functionName: "slashFreelancer",
    });

    if (isError) {
        toast.error("Error slashing");
    }

    if (isSuccess) {
        toast.success("Slashed successfully");
    }


    return (
        <>
            <Button
                className="bg-blue-500 text-white p-2 rounded-md"
                onClick={() => {
                    slashFreelancer({ args: [BigInt(taskId)] });
                }}
                disabled={isLoading}
            >
                {isLoading ? "Slashing..." : "Slash Freelancer"}
            </Button>
        </>
    );
};
