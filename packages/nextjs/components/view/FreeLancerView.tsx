import React from "react";
import { FreeLancerCard } from "~~/components/Freelancer/FreeLancerCard";
import { FreeLancerHeader } from "~~/components/Freelancer/FreeLancerHeader";

export const FreeLancerView = () => {
  return (
    <div className="w-[70%] mx-auto p-2">
      <div>FreeLancer</div>
      <div>
        <FreeLancerHeader />
      </div>
      <div className="">
        <FreeLancerCard />
        <FreeLancerCard />
        <FreeLancerCard />
      </div>
    </div>
  );
};
