import React from "react";
import { FreeLancerCard } from "~~/components/Freelancer/FreeLancerCard";
import { FreeLancerHeader } from "~~/components/Freelancer/FreeLancerHeader";

export const FreeLancerView = () => {
  return (
    <div>
      <div>FreeLancer</div>
      <div>
        <FreeLancerHeader />
      </div>
      <div>
        <FreeLancerCard />
      </div>
    </div>
  );
};
