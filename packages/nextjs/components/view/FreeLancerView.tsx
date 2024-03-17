"use client";

import React from "react";
import { useFreelancerFactory } from "../../hooks/useFreelancerFactory";
import { useNetwork } from "wagmi";
import { FreeLancerCard } from "~~/components/Freelancer/FreeLancerCard";
import { FreeLancerHeader } from "~~/components/Freelancer/FreeLancerHeader";

export const FreeLancerView = () => {
  const { chain } = useNetwork();
  const { freelancersData } = useFreelancerFactory(chain?.id || 84532);

  return (
    <div className="w-[70%] mx-auto p-2">
      <div className=" align-middle text-center font-semibold text-2xl m-4">FreeLancer</div>
      <div className="my-2">
        <FreeLancerHeader />
      </div>
      <div>
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
