"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AskJob } from "~~/components/Freelancer/AskJob";
import { BuyButton } from "~~/components/Freelancer/BuyButton";
import { SellButton } from "~~/components/Freelancer/SellButton";
import { Badge } from "~~/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card";

export const FreeLancerCard = () => {
  const data = {};
  const addr = "";

  const sliceOwner = useCallback((owner: `0x${string}`) => `${owner.slice(0, 6)}...${owner.slice(-4)}`, []);

  const sliceArTxId = useCallback((arTxId: string) => `${arTxId.slice(0, 6)}...${arTxId.slice(-4)}`, []);

  const [isVerfied, setIsVerfied] = useState<boolean>(false);

  useEffect(() => {
    // @ts-ignore
    if (data.owner === addr) {
      setIsVerfied(true);
    }
  });

  return (
    <Card className="mb-4 p-2">
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between">
            <div className="flex flex-row h-7 space-x-3 align-bottom">
              <div className="align-bottom">Owner</div>
              <Badge className="bg-primary">Verified</Badge>
            </div>
            <AskJob />
          </div>
        </CardTitle>
        <CardDescription>
          <div>SkillSet</div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="my-2 overflow-hidden relative max-h-48 w-96">abcde</div>
      </CardContent>
      <CardFooter className="flex justify-between border-t-2 py-3 px-4">
        <div>
          <div className="text-lg">$0.002</div>
          <div className="text-sm text-gray-400">0.00002 ETH / Share</div>
        </div>
        <div className="flex gap-x-2">
          <BuyButton />
          <SellButton />
        </div>
      </CardFooter>
    </Card>
  );
};
