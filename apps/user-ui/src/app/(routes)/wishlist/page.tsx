"use client";

import useDeviceTracking from "@/hooks/useDeviceTracking";
import useLocationTracking from "@/hooks/useLocationTracking";
import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const WishlistPage = () => {
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);

  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };
  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
      ),
    }));
  };

  const removeItem = (id: string) => {
    removeFromWishlist(id, user, location, deviceInfo);
  };

  return (
    <div className="w-full bg-white">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        {/* Heading and Breadcrumbs */}
        <div className="pb-11">
          <h1 className="md:pt-11 font-medium text-5xl leading-[1] mb-4">
            Wishlist
          </h1>
          <Link
            href={"/"}
            className=" text-gray-500 px-4 py-2 rounded-lg hover:underline"
          >
            Home
          </Link>
          <span className="inline-block p-1 mx-1 bg-gray-400 rounded-full"></span>
          <span className="text-gray-500"> Wishlist</span>
        </div>

        {/* If wishlist is empty */}
        {wishlist.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            Your wishlist is empty!
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Wishlist items table */}
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 text-left pl-4">Product</th>
                  <th className="py-3 text-left">Price</th>
                  <th className="py-3 text-left">Quantity</th>
                  <th className="py-3 text-left">Action</th>
                  <th className="py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {wishlist?.map((item: any) => (
                  <tr key={item.id} className="border-b border-b-gray-900">
                    <td className="flex items-center gap-3 p-4">
                      <Image
                        src={item.images[0]?.url}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded"
                      />
                      <span>{item.title}</span>
                    </td>

                    <td className="text-lg">{item?.sale_price.toFixed(2)}</td>

                    <td>
                      <div className="flex justify-center items-center border border-gray-400 rounded-3xl w-[90px] p-1">
                        <button
                          className="text-black cursor-pointer text-xl"
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          -
                        </button>
                        <span className="px-4">{item?.quantity}</span>
                        <button
                          className="text-black cursor-pointer text-xl"
                          onClick={() => increaseQuantity(item.id)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className="bg-orange-500 hover:bg-orange-600 cursor-pointer text-white px-5 py-2 rounded-md transition-all"
                        onClick={() =>
                          addToCart(item, user, location, deviceInfo)
                        }
                      >
                        Add to Cart
                      </button>
                    </td>

                    <td>
                      <button
                        className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-5 py-2 rounded-md transition-all"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove from
                        <br />
                        Wishlist
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
