"use client";

import React from "react";
import { useFreelancerFactory } from "../../hooks/useFreelancerFactory";
import { FreeLancerCard } from "~~/components/Freelancer/FreeLancerCard";
import { FreeLancerHeader } from "~~/components/Freelancer/FreeLancerHeader";
import { useNetwork } from "wagmi";

export const FreeLancerView = () => {
  const { chain } = useNetwork();
  const { freelancersData } = useFreelancerFactory(chain?.id || 84532);

  return (
    <div className="w-[70%] mx-auto p-2">
      <div>FreeLancer</div>
      <div>
        <FreeLancerHeader />
      </div>
      <div className="">
        {
          // @ts-ignore
          freelancersData?.map(freelancer => {
            return <FreeLancerCard key={freelancer.id} data={freelancer} />;
          })
        }
      </div>
    </div>
  );
};
