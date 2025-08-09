"use client";
import axiosInstance from "@/app/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React, { useState } from "react";

const Page = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/api/seller-notifications");
      return res.data.notifications;
    },
  });

  const markAsRead = async (notificationId: string) => {
    await axiosInstance.post("/admin/api/mark-notification-as-read", {
      notificationId,
    });
  };

  return (
    <div className="w-full min-h-screen p-8 text-white">
      {/* Heading and Breadcrumbs */}
      <div className="pb-11">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-2xl py-2 font-semibold text-white">
            Notifications
          </h2>
        </div>
        <Link
          href={"/"}
          className=" text-gray-500 px-4 py-2 rounded-lg hover:underline"
        >
          Home
        </Link>
        <span className="inline-block p-1 mx-1 bg-gray-400 rounded-full"></span>
        <span className="text-gray-500"> Notifications</span>
      </div>

      {!isLoading && data?.length === 0 && (
        <p className="text-center pt-24 text-white text-sm">
          No notifications available yet!
        </p>
      )}

      {!isLoading && data?.length > 0 && (
        <div className="md:w-[80%] my-6 rounded-lg divide-y divide-gray-800 bg-black/40 backdrop-blur-lg shadow-sm">
          {data.map((d: any) => {
            <Link
              key={d.id}
              href={`${d.redirect_link}`}
              className={`block px-5 py-4 transition ${
                d.status !== "Unread"
                  ? "hover:bg-gray-800/40"
                  : "bg-gray-800/50 hover:bg-gray-800/70"
              }`}
              onClick={() => markAsRead(d.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col">
                  <span className="text-white font-medium">{d.title}</span>
                  <span className="text-gray-300 text-sm">{d.message}</span>
                  <span className="text-gray-500 text-xs mt-1">
                    {new Date(d.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            </Link>;
          })}
        </div>
      )}
    </div>
  );
};

export default Page;
