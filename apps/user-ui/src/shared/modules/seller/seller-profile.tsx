"use client";

import {
  Calendar,
  Clock,
  Globe,
  Heart,
  MapPin,
  Star,
  Users,
  X,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { sendKafkaEvent } from "@/actions/track-user";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import useLocationTracking from "@/hooks/useLocationTracking";
import useUser from "@/hooks/useUser";
import ProductCard from "@/shared/components/cards/product-card";
import axiosInstance from "@/utils/axiosInstance";
import { shops } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventNames } from "process";

const TABS = ["Products", "Offers", "Reviews"];

const SellerProfile = ({
  shop,
  followersCount,
}: {
  shop: shops;
  followersCount: number;
}) => {
  const [activeTab, setActiveTab] = useState("Products");
  const [followers, setFollowers] = useState(followersCount);
  const [isFollowing, setIsFollowing] = useState(false);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["seller-products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `seller/api/get-seller-products/${shop?.id}?page=1&limit=10`
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!shop?.id) return;

      try {
        const res = await axiosInstance.get(
          `/seller/api/is-following/${shop?.id}`
        );
        setIsFollowing(res.data.isFollowing !== null);
      } catch (error) {
        console.error("Failed to fetch follow status", error);
      }
    };
    fetchFollowStatus();
  }, [shop?.id]);

  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ["seller-events"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/api/get-seller-events/${shop?.id}?page=1&limit=10`
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 5,
  });

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await axiosInstance.post("/seller/api/unfollow-shop", {
          shopId: shop?.id,
        });
      } else {
        await axiosInstance.post("/seller/api/follow-shop", {
          shopId: shop?.id,
        });
      }
    },
    onSuccess: () => {
      //Flip state only after successful request
      if (isFollowing) {
        setFollowers(followers - 1);
      } else {
        setFollowers(followers + 1);
      }
      setIsFollowing((prev) => !prev);
      queryClient.invalidateQueries({
        queryKey: ["is-following", shop?.id],
      });
    },
    onError: () => {
      console.error("Failed to follow/unfollow the shop.");
    },
  });

  useEffect(() => {
    if (!isLoading) {
      if (!location || !deviceInfo || !user?.id) return;
      sendKafkaEvent({
        userId: user?.id,
        shopId: shop?.id,
        action: "shop_visit",
        // country: location?.country || "Unknown",
        // city: location?.city || "Unknown",
        device: deviceInfo,
      });
    }
  }, [location, deviceInfo, isLoading]);

  return (
    <div>
      <div className="relative w-full flex justify-center">
        {/* <Image
          src={shop?.coverBanner}
          alt="Seller Cover"
          className="w-full h-[400px] object-cover"
          width={1200}
          height={300}
        /> */}
      </div>

      {/* Seller info section */}
      <div className="w-[85%] lg:w-[70%] mt-[-50px] mx-auto relative z-20 flex flex-col">
        <div className="bg-gray-200 p-6 rounded-lg shadow-lg flex-1">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative w-[1000px] h-[1000px] rounded-full border-4 overflow-hidden border-slate-300">
              {/* <Image
                src={shop?.avatar}
                alt="Seller Avatar"
                layout="fill"
                objectFit="cover"
              /> */}
            </div>

            <div className="flex-1 w-full">
              <h1 className="text-2xl font-semibold text-slate-900">
                {shop?.name}
              </h1>
              <p className="text-slate-800 text-sm mt-1">{shop?.bio}</p>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center to-blue-400 gap-1">
                  <Star fill="#60a5fa" size={18} /> <span>{shop?.ratings}</span>
                </div>
                <div className="flex items-center to-slate-700 gap-1">
                  <Star size={18} /> <span>{followers} Followers</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 text-slate-700">
                <Clock size={18} />
                <span>{shop?.opening_hours || "Mon - Sat: 9AM - 6PM"}</span>
              </div>

              <div className="flex items-center gap-2 mt-3 text-slate-700">
                <MapPin size={18} />
                <span>{shop.address}</span>
              </div>
            </div>

            <button
              className={`px-6 py-2 h-[40px] rounded-lg font-semibold flex items-center ${
                isFollowing
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Heart size={18} />
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>
        </div>

        <div className="bg-gray-200 p-6 rounded-lg shadow-lg w-full lg:w-[30%]">
          <h2 className="text-xl font-semibold text-slate-900">Shop Details</h2>

          <div className="flex items-center gap-3 mt-3 text-slate-700">
            <Calendar size={18} />
            <span>
              Joined At: {new Date(shop?.createdAt!).toLocaleDateString()}
            </span>
          </div>

          {shop?.website && (
            <div className="flex items-center gap-3 mt-3 text-slate-700">
              <Globe size={18} />
              <Link
                href={shop?.website}
                className="hover:underline text-blue-600"
              >
                {shop?.website}
              </Link>
            </div>
          )}

          {shop?.socialLinks && shop?.socialLinks.length > 0 && (
            <div className="mt-3">
              <h3 className="text-slate-700 text-lg font-medium">Follow us:</h3>
              <div className="flex gap-3 mt-2">
                {shop?.socialLinks?.map((link: any, index: number) => (
                  <a
                    href={link.url}
                    key={index}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-[0.9]"
                  >
                    {link.type === "youtube" && <Youtube />}
                    {link.type === "x" && <X />}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-[85%] lg:w-[70%] mx-auto mt-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-300">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-6 text-lg font-semibold ${
                activeTab === tab
                  ? "text-slate-800 border-b-2 border-blue-600"
                  : "text-slate-600"
              } transition`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content  */}
        <div className="bg-gray-200 rounded-lg my-4 text-slate-700">
          {activeTab === "Products" && (
            <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4">
              {isLoading && (
                <>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                    ></div>
                  ))}
                </>
              )}
              {products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {products?.length === 0 && (
                <p className="py-2">No products available yet!</p>
              )}
            </div>
          )}

          {activeTab === "Offers" && (
            <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4">
              {isEventsLoading && (
                <>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                      key={index}
                    ></div>
                  ))}
                </>
              )}
              {events?.map((product: any) => (
                <ProductCard
                  isEvent={true}
                  key={product.id}
                  product={product}
                />
              ))}
              {products?.length === 0 && (
                <p className="py-2">No offers available yet!</p>
              )}
            </div>
          )}
          {activeTab === "Reviews" && (
            <div>
              <p className="text-center py-5">No reviews available yet!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
