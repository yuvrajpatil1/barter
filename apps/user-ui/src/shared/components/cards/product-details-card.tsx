import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Ratings from "../ratings/ratings";
import {
  Heart,
  MapPin,
  MessageCircleMore,
  ShoppingCart,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import useUser from "@/hooks/useUser";
import useLocationTracking from "@/hooks/useLocationTracking";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";

const ProductDetailsCard = ({
  data,
  setOpen,
}: {
  data: any;
  setOpen: (open: boolean) => void;
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const [isSelected, setIsSelected] = useState(data?.colors?.[0] || "");
  const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some((item: any) => item.id === data.id);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === data.id);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const router = useRouter();

  const handleChat = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);

    try {
      const res = await axiosInstance.post(
        "/chatting/api/create-user-conversationGroup",
        { sellerId: data?.Shop?.sellerId },
        isProtected
      );
      router.push(`/inbox?conversationId=${res.data.conversation.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className="fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-gray-900/30 z-50"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-[90%] md:w-[70%] md:mt-14 2xl:mt-0 h-max  min-h-[70vh] p-4 md:p-6 bg-white shadow-md rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-full">
            <Image
              src={data?.images?.[activeImage]?.url}
              alt={data?.images?.[activeImage].url}
              height={400}
              width={400}
              className="w-full rounded-lg object-contain"
            />

            {/* Thumbanils */}
            <div className="flex gap-2 mt-4">
              {data?.images?.map((img: any, index: number) => (
                <div
                  className={`cursor-pointer border rounded-md ${
                    activeImage === index
                      ? "border-gray-500 pt-1"
                      : "border-transparent"
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={img?.url}
                    alt={`Thumbnail ${index}`}
                    width={80}
                    height={80}
                    className="rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Right Side */}
          <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
            {/* Seller info */}
            <div className="border-b relative p-3 bg-gray-100 flex items-center justify-between">
              <div className="flex items-start gap-3">
                {/* Shop Logo */}
                <Image
                  src={data?.shops?.avatar}
                  alt="Shop Logo"
                  width={60}
                  height={60}
                  className="rounded-full w-[60px] h-[60px] object-contain"
                />

                <div>
                  <Link
                    href={`/shop/${data?.Shop?.id}`}
                    className="text-lg font-medium"
                  >
                    {data?.Shop?.name}
                  </Link>

                  <span className="block mt-1">
                    <Ratings rating={data?.Shop?.ratings} />
                  </span>

                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <MapPin size={20} />{" "}
                    {data?.Shop?.address || "Location not avilable."}
                  </p>
                </div>
              </div>
              <button
                className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
                onClick={() => handleChat()}
              >
                <MessageCircleMore /> Chat with Seller
              </button>
              <button className="w-full absolute cursor-pointer right-[-10px] top-[-5px] flex justify-end my-2 mt-[-8px]">
                <X size={25} onClick={() => setOpen(false)} />
              </button>
            </div>

            <h3 className="text-xl font-semibold mt-3">{data?.title}</h3>

            <p className="mt-2 text-gray-700 whitespace-pre-wrap w-full">
              {data?.short_description}
            </p>

            {data?.brand && (
              <p className="mt-2">
                <strong>Brand:</strong> {data.brand}
              </p>
            )}

            <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
              {data?.colors?.length > 0 && (
                <div>
                  <strong>Color: </strong>
                  <div className="flex gap-2 mt-1">
                    {data.colors.map((color: string, index: number) => (
                      <button
                        key={index}
                        className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${
                          isSelected === color
                            ? "border-gray-500 scale-105 shadow-md"
                            : "border-gray-300"
                        }`}
                        onClick={() => setIsSelected(color)}
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Options */}
              {data?.sizes?.length > 0 && (
                <div>
                  <strong>Size:</strong>
                  <div className="flex gap-2 mt-1">
                    {data.sizes.map((size: string, index: number) => (
                      <button
                        key={index}
                        className={`px-4 py-1 cursor-pointer rounded-md transition ${
                          isSizeSelected === size
                            ? "bg-gray-800 text-white"
                            : "bg-gray-300 text-black"
                        }`}
                        onClick={() => setIsSizeSelected(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Price Section */}
            <div className="mt-5 flex items-center gap-4">
              <h3 className="text-2xl font-semibold text-gray-900">
                Rs. {data?.sale_price}
              </h3>
              {data?.regular_price && (
                <h3 className="text-lg text-red-600 line-through">
                  Rs. {data.regular_price}
                </h3>
              )}
            </div>

            <div className="mt-5 flex items-center gap-5">
              <div className="flex items-center rounded-md">
                <button
                  className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <span className="px-4 bg-gray-100 py-1">{quantity}</span>
                <button
                  className="px-3 py-1 cursor-pointer bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-r-md"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  +
                </button>
              </div>
              <button
                disabled={isInCart}
                onClick={() =>
                  !isInCart &&
                  addToCart({
                    ...data,
                    quantity,
                    selectedOprions: {
                      color: isSelected,
                      size: isSizeSelected,
                    },
                    user,
                    location,
                    deviceInfo,
                  })
                }
                className={`flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition ${
                  isInCart ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>

              <button className="cursor-pointer">
                <Heart
                  size={30}
                  fill={isWishlisted ? "red" : "trasparent"}
                  color={isWishlisted ? "trasparent" : "black"}
                  onClick={() =>
                    isWishlisted
                      ? removeFromWishlist(data.id, user, location, deviceInfo)
                      : addToWishlist(
                          {
                            ...data,
                            quantity,
                            selectedOprions: {
                              color: isSelected,
                              size: isSizeSelected,
                            },
                          },
                          user,
                          location,
                          deviceInfo
                        )
                  }
                  stroke={isWishlisted ? "red" : "#4B5563"}
                />{" "}
              </button>
              {data.stock > 0 ? (
                <span className="text-green-600 font-semibold">In Stock</span>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>
            <div className="mt-3 text-gray-600 text-sm">
              Estimated Delivery:{" "}
              <strong>{estimatedDelivery.toDateString()}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;
