"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";

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
  // {
  //   label: "Debug Contracts",
  //   href: "/debug",
  //   icon: <BugAntIcon className="h-4 w-4" />,
  // },
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
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
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
  return (
    <div className="sticky lg:static top-0 bg-base-100 min-h-0 flex justify-between items-center align-middle z-20 shadow-md shadow-secondary p-2 m-5">
      <div className="items-center">
        <HeaderMenuLinks />
      </div>

      <div className="flex gap-x-2 mr-4">
        <Button>Create +</Button>
        <ConnectButton />
      </div>
    </div>
  );
};
