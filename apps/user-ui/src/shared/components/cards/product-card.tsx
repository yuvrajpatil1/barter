import Link from "next/link";
import React, { useEffect, useState } from "react";
import Ratings from "../ratings/ratings";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import ProductDetailsCard from "./product-details-card";
import { useStore } from "@/store";
import useUser from "@/hooks/useUser";
import useLocationTracking from "@/hooks/useLocationTracking";
import useDeviceTracking from "@/hooks/useDeviceTracking";

const ProductCard = ({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some((item: any) => item.id === product.id);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === product.id);

  useEffect(() => {
    if (isEvent && product?.ending_date) {
      const interval = setInterval(() => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft("Expired");
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);

        setTimeLeft(`${days}d ${hours}h ${minutes}m left with this price`);
      }, 60000);

      return () => clearInterval(interval);
    }
    return;
  }, []);

  return (
    <div className="w-full h-[500px] bg-white rounded-lg relative flex flex-col">
      {/* Badge Container - Fixed Height */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-20 h-6">
        {isEvent && (
          <div className="bg-red-600 text-white text-xs font-semibold px-2 py-1 shadow-md rounded-sm">
            OFFER
          </div>
        )}
        {product?.stock <= 5 && (
          <div className="bg-yellow-400 text-slate-700 text-xs font-semibold px-2 py-1 shadow-md rounded-sm">
            Limited Stock
          </div>
        )}
      </div>

      {/* Image Container - Fixed Height */}
      <div className="flex-none h-[300px] relative">
        <Link href={`/product/${product?.slug}`}>
          <img
            src={
              product?.images[0]?.url ||
              "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            }
            alt={product?.title}
            width={300}
            height={400}
            className="w-full h-full object-cover rounded-t-md"
          />
        </Link>
      </div>

      {/* Content Container - Flexible Height */}
      <div className="flex-1 flex flex-col justify-between p-2">
        {/* Shop Name - Fixed Height */}
        <div className="h-6 mb-2">
          <Link
            href={`/shop/${product?.Shop?.id}`}
            className="block text-blue-500 text-sm font-medium truncate"
          >
            {product?.Shop?.name || "Shop Name"}
          </Link>
        </div>

        {/* Product Title - Fixed Height (2 lines) */}
        <div className="h-12 mb-2">
          <Link
            href={`/product/${product?.slug}`}
            className="text-base font-semibold text-gray-800 line-clamp-2 leading-6"
          >
            {product?.title || "Product Title"}
          </Link>
        </div>

        {/* Ratings - Fixed Height */}
        <div className="h-6 mb-3">
          <Ratings rating={product?.ratings || 0} />
        </div>

        {/* Price and Sales Container - Fixed Height */}
        <div className="h-6 flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              Rs. {product?.sale_price || 0}
            </span>
            {product?.regular_price &&
              product?.regular_price !== product?.sale_price && (
                <span className="text-sm line-through text-gray-400">
                  Rs. {product?.regular_price}
                </span>
              )}
          </div>
          <span className="text-green-500 text-sm font-medium">
            {product?.totalSales || 0} sold
          </span>
        </div>

        {/* Event Timer - Fixed Height */}
        <div className="h-6 flex items-center">
          {isEvent && timeLeft && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
              {timeLeft}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons - Fixed Position */}
      <div className="absolute z-10 flex flex-col gap-3 right-3 top-3">
        <div className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
          <Heart
            className="cursor-pointer hover:scale-105 transition-transform"
            size={20}
            fill={isWishlisted ? "red" : "trasparent"}
            onClick={() =>
              isWishlisted
                ? removeFromWishlist(product.id, user, location, deviceInfo)
                : addToWishlist(
                    { ...product, quantity: 1 },
                    user,
                    location,
                    deviceInfo
                  )
            }
            stroke={isWishlisted ? "red" : "#4B5563"}
          />
        </div>
        <div className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
          <Eye
            className="cursor-pointer text-gray-600 hover:scale-105 transition-transform"
            size={20}
            onClick={() => setOpen(!open)}
          />
        </div>
        <div className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
          <ShoppingCart
            className="cursor-pointer text-gray-600 hover:scale-105 transition-transform"
            size={20}
            onClick={() =>
              !isInCart &&
              addToCart({ ...product, quantity: 1 }, user, location, deviceInfo)
            }
          />
        </div>
      </div>

      {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
    </div>
  );
};

export default ProductCard;
