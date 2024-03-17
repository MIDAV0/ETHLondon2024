"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { NounsAvatar } from "../Avatars/NounsAvatar";
import { Input } from "../ui/input";
import { formatUnits, parseEther } from "viem";
import { useContractRead } from "wagmi";
import { AskJob } from "~~/components/Freelancer/AskJob";
import { BuyButton } from "~~/components/Freelancer/BuyButton";
import { SellButton } from "~~/components/Freelancer/SellButton";
import { TippingModal } from "~~/components/tipping/TippingModal";
import { Badge } from "~~/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card";
import { STAKING_CONTRACT_ABI } from "~~/contracts/StakingContract";
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
  const { sharePrice, tokenAddress } = useStakingContract({ contractAddress: data.stakingContractAddress });

  const [tradeAmount, setTradeAmount] = useState<number>(0);

  const sliceOwner = useCallback((owner: string) => `${owner.slice(0, 6)}...${owner.slice(-4)}`, []);

  const [isVerfied, setIsVerfied] = useState<boolean>(false);

  const { data: getBuyPriceData } = useContractRead({
    address: data.stakingContractAddress,
    abi: STAKING_CONTRACT_ABI,
    functionName: "getBuyPrice",
    watch: true, // This tells wagmi to re-fetch when changes are detected
    args: [parseEther(tradeAmount.toString())], // Pass jobPrice as an argument
    enabled: tradeAmount !== 0,
  }) as { data: bigint | undefined };

  const { data: getSellPriceData } = useContractRead({
    address: data.stakingContractAddress,
    abi: STAKING_CONTRACT_ABI,
    functionName: "getSellPrice",
    watch: true, // This tells wagmi to re-fetch when changes are detected
    args: [parseEther(tradeAmount.toString())], // Pass jobPrice as an argument
    enabled: tradeAmount !== 0,
  }) as { data: bigint | undefined };

  const addr = "0x123";
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

  const roundMath = (value: string, decimals: number) => {
    const valueNum = Number(value);
    if (valueNum === 0) return 0;
    return Number(Math.round(Number(valueNum + "e" + decimals)) + "e-" + decimals);
  };

  const getUsdPrice = (price: string) => {
    if (price === "") return 0;
    const priceUsd = 3600 * Number(price);
    const roundPrice = roundMath(priceUsd.toString(), 5);
    return roundPrice;
  };
  return (
    <Card className="mb-4 p-2">
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between">
            <div className="flex flex-row h-7 space-x-3 align-bottom">
              <div className="flex flex-row items-center align-bottom space-x-5">
                <p>
                  {data.name} - {sliceOwner(data.owner)}
                </p>
                <NounsAvatar />
              </div>
              {isVerfied && <Badge className="bg-primary">Verified</Badge>}
            </div>
            <div className="space-x-3">
              <TippingModal />
              <AskJob contractAddress={data.stakingContractAddress} tokenAddress={tokenAddress || ""} />
            </div>
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
          <div className="text-lg">${getUsdPrice(sharePrice ?? "")}</div>
          <div className="text-sm text-gray-400">{roundMath(sharePrice ?? "", 5)} ETH / Share</div>
        </div>
        <div className="flex flex-row space-x-3">
          <div className="flex flex-col justify-between">
            <Input
              type="number"
              placeholder="Shares"
              value={tradeAmount}
              onChange={e => setTradeAmount(Number(e.target.value))}
              min={0}
              step=".01"
            />
            <div className="flex flex-row justify-between space-x-4">
              <BuyButton
                contractAddress={data.stakingContractAddress}
                shares={parseEther(tradeAmount.toString())}
                price={getBuyPriceData || BigInt(0)}
              />
              <SellButton
                contractAddress={data.stakingContractAddress}
                shares={parseEther(tradeAmount.toString())}
                price={getBuyPriceData || BigInt(0)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between space-y-2">
            <div className="p-2 border-2 border-green-500 rounded-lg">
              <p>Pay {getBuyPriceData ? formatUnits(getBuyPriceData, 18) : 0} ETH</p>
            </div>
            <div className="p-2 border-2 border-red-500 rounded-lg">
              <p>Receive {getSellPriceData ? formatUnits(getSellPriceData, 18) : 0} ETH</p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
