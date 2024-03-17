import { Button } from "./ui/button";
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";
import type { ISuccessResult } from "@worldcoin/idkit";
import type { VerifyReply } from "~~/app/api/verify/route";

const WorldCoinProof = ({ userAddress }: { userAddress: string }) => {
  if (!process.env.NEXT_PUBLIC_WLD_APP_ID) {
    throw new Error("app_id is not set in environment variables!");
  }
  if (!process.env.NEXT_PUBLIC_WLD_ACTION) {
    throw new Error("app_id is not set in environment variables!");
  }

  const onSuccess = async (result: ISuccessResult) => {
    // This is where you should perform frontend actions once a user has been verified, such as redirecting to a new page
    console.log("Successfully verified with World ID! Your nullifier hash is: " + result.nullifier_hash);
    console.log(userAddress)
    await fetch("/api/create-user-record", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nullifier_hash: result.nullifier_hash,
        address: userAddress,
      }),
    }).then(res => {
      console.log(res);
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      console.log("User added to database");
      return res.json();
    });
  };

  const handleProof = async (result: ISuccessResult) => {
    console.log("Proof received from IDKit:\n", JSON.stringify(result)); // Log the proof from IDKit to the console for visibility
    const reqBody = {
      merkle_root: result.merkle_root,
      nullifier_hash: result.nullifier_hash,
      proof: result.proof,
      verification_level: result.verification_level,
      action: process.env.NEXT_PUBLIC_WLD_ACTION,
      signal: "",
    };
    console.log("Sending proof to backend for verification:\n", JSON.stringify(reqBody)); // Log the proof being sent to our backend for visibility
    const res: Response = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });
    const data: VerifyReply = await res.json();
    if (res.status == 200) {
      console.log("Successful response from backend:\n", data); // Log the response from our backend for visibility

    } else {
      throw new Error(`Error code ${res.status} (${data.code}): ${data.detail}` ?? "Unknown error."); // Throw an error if verification fails
    }
  };

  return (
    <div className=" mt-5 border border-black rounded-lg p-5 flex justify-between align-middle space-x-3">
      <div className="w-[60%] mx-5 font-semibold">
        Please verify your identity with World ID to proof you are human.
      </div>
      <IDKitWidget
        action={process.env.NEXT_PUBLIC_WLD_ACTION}
        app_id={process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`}
        onSuccess={onSuccess}
        handleVerify={handleProof}
        verification_level={VerificationLevel.Orb} // Change this to VerificationLevel.Device to accept Orb- and Device-verified users
      >
        {({ open }) => <Button onClick={open}>Verify with World ID</Button>}
      </IDKitWidget>
    </div>
  );
};

export default WorldCoinProof;
