import React from "react";
import { useContractWrite } from "wagmi";
import { Button } from "~~/components/ui/button";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";
import { toast } from "sonner"


export const CancelTask = (taskId: number) => {
    const { write: cancelTask, isError, isSuccess, isLoading } = useContractWrite({
        abi: STAKING_CONTRACT_ABI,
        address: "0x1234567890123456789012345678901234567890",
        functionName: "cancelTask",
    });

    if (isError) {
        toast.error("Error cancelling task");
    }

    if (isSuccess) {
        toast.success("Task cancelled successfully");
    }


    return (
        <>
            <Button
                className="bg-blue-500 text-white p-2 rounded-md"
                onClick={() => {
                    cancelTask({ args: [BigInt(taskId)] });
                }}
                disabled={isLoading}
            >
                {isLoading ? "Cancelling..." : "Cancel Task"}
            </Button>
        </>
    );
};
