"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { TotalNumFreelancer } from "~~/components/Freelancer/TotalNumFreelancer";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="">Main Page</div>
      <div>{connectedAddress}</div>
      <TotalNumFreelancer />
    </>
  );
};

export default Home;
