import { NextResponse } from "next/server";

// import https from 'https';

export const config = {
  api: {
    externalResolver: true,
  },
};

export type VerifyReply = {
  code: string;
  detail: string;
  hash: string;
};

const verifyEndpoint = `${process.env.NEXT_PUBLIC_WLD_API_BASE_URL}/api/v1/verify/${process.env.NEXT_PUBLIC_WLD_APP_ID}`;
console.log("verifyEndpoint: ", verifyEndpoint);
export async function POST(request: Request) {
  let nullifier_hash;
  const res = await request.json(); // res now contains body
  console.log("Received request to verify credential:\n", res);

  console.log("Sending request to World ID /verify endpoint:\n", res);

  fetch(verifyEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(res),
    // agent: new https.Agent({ rejectUnauthorized: false }),
  })
    .then(verifyRes => {
      if (!verifyRes.ok) {
        throw new Error("Network response was not ok");
      }
      verifyRes.json().then(wldResponse => {
        console.log(`Received ${verifyRes.status} response from World ID /verify endpoint:\n`, wldResponse);
        if (verifyRes.status == 200) {
          // This is where you should perform backend actions based on the verified credential, such as setting a user as "verified" in a database
          // For this example, we'll just return a 200 response and console.log the verified credential
          console.log("Credential verified! This user's nullifier hash is: ", wldResponse.nullifier_hash);
          nullifier_hash = wldResponse.nullifier_hash;
        }
      });
    })
    .catch(error => {
      console.error("Error during fetch operation:", error);
      return NextResponse.json({
        status: 500,
        data: {
          code: "error",
          detail: "Internal server error",
        },
      });
    });

  return NextResponse.json({
    status: 200,
    data: { code: "success", detail: "This action verified correctly!", hash: nullifier_hash },
  });
}
