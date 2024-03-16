"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AskJob } from "~~/components/Freelancer/AskJob";
import { BuyButton } from "~~/components/Freelancer/BuyButton";
import { SellButton } from "~~/components/Freelancer/SellButton";
import { TippingModal } from "~~/components/tipping/TippingModal";
import { Badge } from "~~/components/ui/badge";
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

  const sliceOwner = useCallback((owner: string) => `${owner.slice(0, 6)}...${owner.slice(-4)}`, []);

  const [isVerfied, setIsVerfied] = useState<boolean>(false);

  useEffect(() => {
    // @ts-ignore
    const checkUserRecord = async () => {
      fetch("/check-user-record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: data.owner }),
      })
        .then(res => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then(data => {
          console.log("data", data);
          setIsVerfied(data.verified);
        })
        .catch(error => {
          console.error("Error:", error);
        });
    };
    checkUserRecord();
  }, [data.owner]);

  return (
    <Card className="mb-4 p-2">
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between">
            <div className="flex flex-row h-7 space-x-3 align-bottom">
              <div className="align-bottom">
                {data.name} - {sliceOwner(data.owner)}
              </div>
              {isVerfied && <Badge className="bg-primary">Verified</Badge>}
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
          <TippingModal />
          <BuyButton />
          <SellButton />
        </div>
      </CardFooter>
    </Card>
  );
};
