import { usePathname } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card";
import { Label } from "~~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { useStakingContract } from "~~/hooks/useStakingContract";

// interface TaskData {
//   id: number;
//   startTime: number;
//   duration: number;
//   shares: number;
//   stakeAmount: number;
//   status: number;
//   client: string;
//   title: string;
//   description: string;
// }

// const testTasks: TaskData[] = [
//   {
//     id: 1,
//     startTime: 1630502400,
//     duration: 86400,
//     shares: 100,
//     stakeAmount: 100,
//     status: 0,
//     client: "0x123",
//     title: "Task 1",
//     description: "This is a description of task 1",
//   },
//   {
//     id: 2,
//     startTime: 1630502400,
//     duration: 86400,
//     shares: 100,
//     stakeAmount: 100,
//     status: 1,
//     client: "0x123",
//     title: "Task 2",
//     description: "This is a description of task 2",
//   },
//   {
//     id: 3,
//     startTime: 1630502400,
//     duration: 86400,
//     shares: 100,
//     stakeAmount: 100,
//     status: 2,
//     client: "0x123",
//     title: "Task 3",
//     description: "This is a description of task 3",
//   },
// ];

export const MainPage = () => {
  const pathname = usePathname();
  const contractAddress = pathname.slice(16);
  const { tasksData, sharePrice } = useStakingContract({ contractAddress: contractAddress });

  const MatchStatus = ({ status }: { status: number }) => {
    console.log(status);
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
    <Tabs defaultValue="viewPage" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="accountPage">Freelancer Account</TabsTrigger>
        <TabsTrigger value="viewPage">Freelancer Page</TabsTrigger>
      </TabsList>
      <TabsContent value="accountPage">
        <div>
          <CardHeader>
            <CardTitle>Freelancer Name Account</CardTitle>
            <CardDescription>View your tasks here</CardDescription>
          </CardHeader>
          <div className="grid grid-cols-2 gap-4 p-4">
            {tasksData?.map((task, index) => (
              <Card key={index} className="p-2">
                <CardHeader>
                  <CardTitle>
                    <div className="flex justify-between">
                      <div>
                        {task.id}. {task.title}
                      </div>
                      <MatchStatus status={task.status} />
                    </div>
                  </CardTitle>
                  <CardDescription>
                    <div>{task.description}</div>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between border-t-2 py-3 px-4">
                  <div>
                    <div className="text-lg">{task.shares} Shares = 15 $</div>
                    <div className="text-sm text-gray-400">{sharePrice} ETH / Share</div>
                  </div>
                  <div className="flex gap-x-2">
                    {/* <BuyButton />
                        <SellButton /> */}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="viewPage">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Make changes to your account here. Click save when youre done.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Label>Save changes</Label>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
