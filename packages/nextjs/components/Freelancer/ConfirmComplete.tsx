import React from "react";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";
import { toast } from "sonner"


export const ConfirmCompletion = (taskId: number) => {
    const { write: confirmCompletion, isError, isSuccess, isLoading } = useContractWrite({
        abi: STAKING_CONTRACT_ABI,
        address: "0x1234567890123456789012345678901234567890",
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
