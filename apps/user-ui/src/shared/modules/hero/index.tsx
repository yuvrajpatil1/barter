"use client";
import Image from "next/image";
// import useLayout from "../../../hooks/useLayout";
import { MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import useLayout from "@/hooks/useLayout";

const Hero = () => {
  const router = useRouter();
  const { layout } = useLayout();

  return (
    <div className="bg-gray-700 h-[85vh] flex flex-col justify-center w-full">
      <div className="md:w-[80%] w-[90%] m-auto md:flex h-full items-center">
        <div className="md:w-1/2">
          <p className="font-normal text-white pb-2 text-xl">
            Starting from Rs. 2000/-
          </p>
          <h1 className="text-white text-6xl font-extrabold">
            The Best Watch <br /> Collection 2025
          </h1>
          <p className="font-oregano text-3xl pt-4 text-white">
            Exclusive Offer <span className="text-yellow-400">10%</span> off
            this week
          </p>
          <br />
          <button
            onClick={() => router.push("/products")}
            className="w-[140px] gap-2 font-semibold h-[40px] hover:text-white"
          >
            Shop Now <MoveRight />
          </button>
        </div>
        <div className="md:1/2 flex justify-center">
          <Image src={layout.banner} alt="" width={450} height={450} />
        </div>
      </div>
    </div>
  );
};

export default Hero;
