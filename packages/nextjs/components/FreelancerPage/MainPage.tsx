import { usePathname } from "next/navigation";
import { NounsAvatar } from "../Avatars/NounsAvatar";
import { SlashFreelancer } from "../Freelancer/SlashFreelancer";
import WorldCoinProof from "../WorldCoinProof";
import { CalendarComponent } from "./CalendarComponent";
import LineGraph from "./LineGraph";
import { formatUnits } from "viem";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import { CancelTask } from "~~/components/Freelancer/CancelTask";
import { ConfirmCompletion } from "~~/components/Freelancer/ConfirmComplete";
import { ConfirmDelivery } from "~~/components/Freelancer/ConfirmDelivery";
import { StartTask } from "~~/components/Freelancer/StartTask";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card";
import { Label } from "~~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { CONTRACT_FACTORY_ABI } from "~~/contracts/ContractFactory";
import { useStakingContract } from "~~/hooks/useStakingContract";
import chainSmart from "~~/utils/chainSmart";

export const MainPage = () => {
  const pathname = usePathname();
  const contractAddress = pathname.slice(16);
  const { address } = useAccount();
  const { chain } = useNetwork();

  const smartContract = chainSmart(chain?.id || 84532);

  const { data: freelancerInfo } = useContractRead({
    address: smartContract,
    abi: CONTRACT_FACTORY_ABI,
    functionName: "freelancerInfoMapping",
    args: [contractAddress],
    watch: true,
  }) as { data: string | undefined };

  const { sharePrice, tasksData, tasksForClient } = useStakingContract({
    contractAddress: freelancerInfo?.[3] as string,
  });

  const MatchStatus = ({ status }: { status: number }) => {
    switch (status) {
      case 0:
        return (
          <div className="p-2 rounded-lg bg-gradient-to-r from-stone-500 text-sm">
            <p>NOT STARTED</p>
          </div>
        );
      case 1:
        return (
          <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 text-sm">
            <p>IN PROGRESS</p>
          </div>
        );
      case 2:
        return (
          <div className="p-2 rounded-lg bg-gradient-to-r from-red-600 text-sm">
            <p>CANCELED</p>
          </div>
        );
      case 3:
        return (
          <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-400 text-sm">
            <p>WORK DELIVERED</p>
          </div>
        );
      case 4:
        return (
          <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-400 text-sm">
            <p>WORK VALIDATED</p>
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 text-sm">
            <p>WORK_COMPLETED</p>
          </div>
        );
    }
  };

  return (
    <Tabs defaultValue={contractAddress === address ? "accountPage" : "viewPage"} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="accountPage" disabled={contractAddress !== address}>
          Freelancer Account
        </TabsTrigger>
        <TabsTrigger value="viewPage" disabled={contractAddress === address}>
          Freelancer Page
        </TabsTrigger>
      </TabsList>
      <TabsContent value="accountPage">
        <div className="p-2">
          <CardHeader>
            <CardTitle>
              <div className="flex flex-row items-center space-x-5">
                <p>{freelancerInfo?.[1]} Account</p>
                <NounsAvatar />
              </div>
            </CardTitle>
            <CardDescription>{freelancerInfo?.[2]}</CardDescription>
          </CardHeader>
          <div className="flex flex-row">
            <div className="flex flex-col">
              <div className="p-6">{contractAddress === address && <WorldCoinProof userAddress={address} />}</div>
              <div className="w-[742px] border border-black rounded-lg p-5 self-center">
                <Label className="text-lg font-semibold mx-auto">Share Price</Label>
                <div className="text-lg">{sharePrice} ETH</div>
                <div className="text-lg">{Number(sharePrice) * 3500} USD</div>
              </div>
            </div>
            <div className="flex flex-col mx-auto space-y-4">
              <p className="text-lg font-bold text-center">Check your schedule</p>
              <CalendarComponent />
            </div>
          </div>
          <p className="text-lg font-semibold border-b-2 ml-4">Your jobs</p>
          <div className="grid grid-cols-2 gap-4 p-4">
            {tasksData?.map((task: any, index) => (
              <Card key={index} className="p-2">
                <CardHeader>
                  <CardTitle>
                    <div className="flex justify-between">
                      <div>
                        {Number(task?.[0])}. {task?.[7]}
                      </div>
                      <MatchStatus status={task?.[5]} />
                    </div>
                  </CardTitle>
                  <CardDescription>
                    <div>{task?.[8]}</div>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between border-t-2 py-3 px-4">
                  <div>
                    <div className="text-lg">
                      {formatUnits(task?.[3], 18)} Shares ={" "}
                      {Math.round(3500 * Number(sharePrice) * Number(formatUnits(task?.[3], 18)) * 100) / 100} $
                    </div>
                    <div className="text-sm text-gray-400">
                      {sharePrice ? Math.round(Number(sharePrice) * 100000) / 100000 : 0} ETH / Share
                    </div>
                  </div>
                  {address && (
                    <div className="flex gap-x-2">
                      {task?.[5] === 0 && (
                        <StartTask taskId={Number(task?.[0])} contractAddress={freelancerInfo?.[3] as string} />
                      )}
                      {task?.[5] === 1 && (
                        <ConfirmDelivery taskId={Number(task?.[0])} contractAddress={freelancerInfo?.[3] as string} />
                      )}
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="viewPage" className="p-2">
        <Card className="p-2">
          <CardHeader>
            <CardTitle>
              <div className="flex flex-row items-center space-x-5">
                <p>{freelancerInfo?.[1]} Account</p>
                <NounsAvatar />
              </div>
            </CardTitle>
            <CardDescription>{freelancerInfo?.[2]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-row">
              {contractAddress !== address && (
                <div className="flex flex-col space-y-4 p-4 w-2/5">
                  <p className="text-lg font-semibold border-b-2">
                    Your jobs with <span className="font-extrabold">{freelancerInfo?.[1]}</span>
                  </p>
                  {tasksForClient?.map((task: any, index) => (
                    <Card key={index} className="p-2">
                      <CardHeader>
                        <CardTitle>
                          <div className="flex justify-between">
                            <div>
                              {Number(task?.[0])}. {task?.[7]}
                            </div>
                            <MatchStatus status={task?.[5]} />
                          </div>
                        </CardTitle>
                        <CardDescription>
                          <div>{task?.[8]}</div>
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-between border-t-2 py-3 px-4">
                        <div>
                          <div className="text-lg">
                            {formatUnits(task?.[3], 18)} Shares ={" "}
                            {Math.round(3500 * Number(sharePrice) * Number(formatUnits(task?.[3], 18)) * 100) / 100} $
                          </div>{" "}
                          <div className="text-sm text-gray-400">
                            {sharePrice ? Math.round(Number(sharePrice) * 100000) / 100000 : 0} ETH / Share
                          </div>{" "}
                        </div>
                        {task?.[6] === address && (
                          <div className="flex gap-x-2">
                            {task?.[5] === 1 && (
                              <SlashFreelancer taskId={task.id} contractAddress={freelancerInfo?.[3] as string} />
                            )}
                            {task?.[5] === 3 && (
                              <ConfirmCompletion taskId={task.id} contractAddress={freelancerInfo?.[3] as string} />
                            )}
                            {task?.[5] === 0 && (
                              <CancelTask taskId={Number(task?.[0])} contractAddress={freelancerInfo?.[3] as string} />
                            )}
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
              <div className="flex flex-row justify-between space-x-4">
                <div className="flex flex-col mx-auto space-y-4">
                  <p className="text-lg font-bold text-center">Check Freelancer schedule</p>
                  <CalendarComponent />
                </div>
                <LineGraph />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
