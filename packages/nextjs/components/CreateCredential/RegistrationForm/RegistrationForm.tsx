"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { parseEther } from "viem/utils";
import { useAccount } from "wagmi";
import { useContractWrite } from "wagmi";
import { z } from "zod";
import { Button } from "~~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~~/components/ui/form";
import { Input } from "~~/components/ui/input";
import { CONTRACT_FACTORY_ABI } from "~~/contracts/ContractFactory";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  description: z.string().max(100, {
    message: "Description must be at most 100 characters.",
  }),
  tokenName: z.string().min(2, {
    message: "Token name must be at least 2 characters.",
  }),
  tokenSymbol: z.string().max(5, {
    message: "Token symbol must be at most 5 characters.",
  }),
  numberOfShares: z.string().max(10, {
    message: "Number of shares must be a positive integer.",
  }),
  stakesAmount: z.string().max(10, {
    message: "Stake amount must be a positive integer.",
  }),
});

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      tokenName: "",
      tokenSymbol: "",
      numberOfShares: "",
      stakesAmount: "",
    },
  });
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: "0xBfec823dF7352Cf08388877647c0E89A2b242F9D",
    abi: CONTRACT_FACTORY_ABI,
    functionName: "createContract",
  });

  const { address } = useAccount();

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const processedValues = {
      ...values,
      numberOfShares: BigInt(values.numberOfShares),
      stakesAmount: parseEther(values.stakesAmount),
    };
    write({
      args: [
        processedValues.name,
        processedValues.description,
        processedValues.tokenName,
        processedValues.tokenSymbol,
        processedValues.numberOfShares,
        processedValues.stakesAmount,
        "0xcC2042a7c7997a04e26389B9689f2AE766342732",
      ],
      value: parseEther(values.stakesAmount),
    });

    console.log(processedValues);
  }


  const sliceAddress = (address: string) => {
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  const toScan = (hash: string) => {
    return `https://sepolia.basescan.org/address/${hash}`;
  };

  const [tokenShares, setTokenShares] = useState(24);
  const [stakesAmount, setStakesAmount] = useState(0);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tokenName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token Name</FormLabel>
              <FormControl>
                <Input placeholder="Token Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tokenSymbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token Symbol</FormLabel>
              <FormControl>
                <Input placeholder="Token Symbol" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row items-center justify-between">
          <FormField
            control={form.control}
            name="numberOfShares"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number Of Shares</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Number Of Shares"
                    {...field}
                    type="number"
                    min={24}
                    max={720}
                    onChange={e => {
                      setTokenShares(Number(e.target.value));
                    }}
                    value={tokenShares}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stakesAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stake Amount</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Stake Amount (ETH)"
                    {...field}
                    type="number"
                    onChange={e => {
                      setStakesAmount(Number(e.target.value));
                    }}
                    value={stakesAmount}
                    min={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-center">
          <p>
            Hourly Rate: {stakesAmount && tokenShares ? Math.round((stakesAmount / tokenShares) * 10000) / 10000 : 0}{" "}
            ETH/hr
          </p>
        </div>
        <Button type="submit">Submit</Button>
        {data && (
          <div>
            Transaction Hash:
            <a onClick={toScan(data.hash)}>{sliceAddress(data.hash)}</a>
          </div>
        )}
        {isLoading && <div>Waiting for confirmation...</div>}
        {isSuccess && <div>Transaction confirmed.</div>}
      </form>
    </Form>
  );
}
