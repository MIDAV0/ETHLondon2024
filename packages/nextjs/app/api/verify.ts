import type { NextApiRequest, NextApiResponse } from "next";
import { createUserRecord } from './db'; 

export const config = {
  api: {
    externalResolver: true,
  },
};

export type VerifyReply = {
  code: string;
  detail: string;
};

const verifyEndpoint = `${process.env.NEXT_PUBLIC_WLD_API_BASE_URL}/api/v1/verify/${process.env.NEXT_PUBLIC_WLD_APP_ID}`;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyReply>
) {
  console.log("Received request to verify credential:\n", req.body);
  const reqBody = {
    nullifier_hash: req.body.nullifier_hash,
    merkle_root: req.body.merkle_root,
    proof: req.body.proof,
    verification_level: req.body.verification_level,
    action: req.body.action,
    signal: req.body.signal,
  };
  console.log("Sending request to World ID /verify endpoint:\n", reqBody);

  fetch(verifyEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqBody),
  })
  .then((verifyRes) => {
    if (!verifyRes.ok) {
      throw new Error('Network response was not ok');
    }
    return verifyRes.json()
      .then(async (wldResponse) => { // Add 'async' here
        console.log(
          `Received ${verifyRes.status} response from World ID /verify endpoint:\n`,
          wldResponse
        );
        if (verifyRes.status == 200) {
          console.log(
            "Credential verified! This user's nullifier hash is: ",
            wldResponse.nullifier_hash
          );

        try {
          await createUserRecord(wldResponse.nullifier_hash, true, req.body.address);
        } catch (error) {
          return res.status(500).send({ code: 'error', detail: 'Internal server error' });
        }

          res.status(verifyRes.status).send({
            code: "success",
            detail: "This action verified correctly!",
          });
        } else {
          res.status(verifyRes.status).send({ code: wldResponse.code, detail: wldResponse.detail });
        }
      });
  })
  .catch((error) => {
    console.error('Error during fetch operation:', error);
    res.status(500).send({ code: 'error', detail: 'Internal server error' });
  });
}