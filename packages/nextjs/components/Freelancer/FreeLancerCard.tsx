"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AskJob } from "~~/components/Freelancer/AskJob";
import { BuyButton } from "~~/components/Freelancer/BuyButton";
import { SellButton } from "~~/components/Freelancer/SellButton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card";
import useStakingContract from "~~/hooks/useStakingContract";

export const FreeLancerCard = ({
  data,
}: {
  data: {
    id: number;
    name: string;
    description: string;
    stakingContractAddress: string;
    owner: string;
  };
}) => {
  const { sharePrice } = useStakingContract({ contractAddress: data.stakingContractAddress });

  console.log(sharePrice);

  const sliceOwner = useCallback((owner: `0x${string}`) => `${owner.slice(0, 6)}...${owner.slice(-4)}`, []);

  const sliceArTxId = useCallback((arTxId: string) => `${arTxId.slice(0, 6)}...${arTxId.slice(-4)}`, []);

  return (
    <Card className="mb-4 p-2">
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between">
            <div>
              {data.name} - {data.owner}
            </div>
            <AskJob />
          </div>
        </CardTitle>
        <CardDescription>
          <div>SkillSet</div>
          <p>{data.description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex">
          <div className="p-2 bg-slate-600 rounded-xl font-bold text-white">
            <Link href={`/freelancerPage/${data.owner}`}>Freelancer Page</Link>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t-2 py-3 px-4">
        <div>
          <div className="text-lg">$0.002</div>
          <div className="text-sm text-gray-400">{sharePrice} ETH / Share</div>
        </div>
        <div className="flex gap-x-2">
          <BuyButton />
          <SellButton />
        </div>
      </CardFooter>
    </Card>
  );
};
