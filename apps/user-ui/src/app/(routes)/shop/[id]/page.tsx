import SellerProfile from "@/shared/modules/seller/seller-profile";
import axiosInstance from "@/utils/axiosInstance";
import { Metadata } from "next";
import React from "react";

async function fetchSellerDetails(id: string) {
  const response = await axiosInstance.get(`/seller/api/get-seller/${id}`);
  return response.data;
}

//Dynamic Metadata generation
async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const data = await fetchSellerDetails(params.id);

  return {
    title: `${data?.shop?.name} | Barter`,
    description:
      data?.shop?.bio ||
      "Explore products and services from trusted sellers on Barter.",
    openGraph: {
      title: `${data?.shop?.name} | Barter`,
      description:
        data?.shop?.bio ||
        "Explore products and services from trusted sellers on Barter.",
      type: "website",
      images: [
        {
          url: data?.shop?.avatar,
          width: 800,
          height: 600,
          alt: data?.shop?.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data?.shop?.name} | Barter`,
      description:
        data?.shop?.bio ||
        "Explore products and services from trusted sellers on Barter.",
      images: [data?.shop?.avatar],
    },
  };
}

const Page = async ({ params }: { params: { id: string } }) => {
  const data = await fetchSellerDetails(params.id);
  return (
    <div>
      <SellerProfile shop={data?.shop} followersCount={data?.followersCount} />
    </div>
  );
};

export default Page;
