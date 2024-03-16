// import { TotalNumFreelancer } from "./TotalNumFreelancer";
import { Button } from "~~/components/ui/button";
import { Input } from "~~/components/ui/input";

export const FreeLancerHeader = () => {
  return (
    <div className="flex justify-between gap-x-2">
      <Input type="email" placeholder="Search FreeLancer" />
      <Button type="submit">Search</Button>
      {/* <TotalNumFreelancer /> */}
    </div>
  );
};
