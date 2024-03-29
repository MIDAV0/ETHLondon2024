"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RegisterHuman } from "./CreateCredential/RegisterHuman";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useContractRead } from "wagmi";
import { useNetwork } from "wagmi";
import { CONTRACT_FACTORY_ABI } from "~~/contracts/ContractFactory";
import chainSmart from "~~/utils/chainSmart";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Freelancer",
    href: "/freelancers",
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href} className="list-none">
            <Link
              href={href}
              passHref
              className={`${isActive ? "bg-secondary shadow-md" : ""
                }  hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const smartContract = chainSmart(chain?.id || 84532);

  const { data: registered } = useContractRead({
    address: smartContract,
    abi: CONTRACT_FACTORY_ABI,
    functionName: "freelancerInfoMapping",
    args: [address],
    watch: true,
    enabled: !!address,
  }) as { data: string | undefined };

  const isRegistered = address === registered?.[4];

  return (
    <div className="sticky lg:static top-0 bg-base-100 min-h-0 flex justify-between items-center align-middle z-20 shadow-md shadow-secondary p-2 m-5">
      <div className="items-center flex flex-row space-x-3">
        <HeaderMenuLinks />
      </div>

      <div className="flex gap-x-2 mr-4 items-center">
        {isConnected &&
          (!isRegistered ? (
            // Show the RegisterHuman component if the user is not registered
            <RegisterHuman />
          ) : (
            // Show the link to the freelancer page if the user is registered
            <div className="p-2 bg-slate-600 rounded-xl font-bold text-white">
              <Link href={`/freelancerPage/${address}`}>Freelancer Page</Link>
            </div>
          ))}
        <ConnectButton />
      </div>
    </div>
  );
};
