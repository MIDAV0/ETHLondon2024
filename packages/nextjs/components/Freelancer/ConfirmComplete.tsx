import React from "react";
import { toast } from "sonner";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";
import { buttonConfig } from "~~/types";


export const ConfirmCompletion = ({ taskId, contractAddress }: buttonConfig) => {
    const {
        write: confirmCompletion,
        isError,
        isSuccess,
        isLoading,
    } = useContractWrite({
        abi: STAKING_CONTRACT_ABI,
        address: contractAddress as `0x${string}`,
        functionName: "confirmWorkCompletedClient",
    });

    if (isError) {
        toast.error("Error confirming");
    }

    if (isSuccess) {
        toast.success("Confirming successfully");
    }

    return (
        <>
            <Button
                className="bg-blue-500 text-white p-2 rounded-md"
                onClick={() => {
                    confirmCompletion({ args: [BigInt(taskId), true] });
                }}
                disabled={isLoading}
            >
                {isLoading ? "Confirming..." : "Confirm Completion"}
            </Button>
        </>
    );
};
