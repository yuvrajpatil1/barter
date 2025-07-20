"use client";

import useDeviceTracking from "@/hooks/useDeviceTracking";
import useLocationTracking from "@/hooks/useLocationTracking";
import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CartPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const cart = useStore((state: any) => state.cart);
  const [discountedProductId, setDiscountedProductId] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const createPaymentSession = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("order/api/create-payment-session", {
        cart,
        selectedAddressId,
        coupon: {},
      });

      const sessionId = res.data.sessionId;
      router.push(`/checkout?sessionId=${sessionId}`);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const [loading, setLoading] = useState(false);

  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };
  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
      ),
    }));
  };

  const removeItem = (id: string) => {
    removeFromCart(id, user, location, deviceInfo);
  };

  const subtotal = cart.reduce(
    (total: number, item: any) => total + item.quantity * item.sale_price,
    0
  );

  //get addresses
  const { data: addresses = [] } = useQuery({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((addr: any) => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    }
  }, [addresses, selectedAddressId]);

  return (
    <div className="w-full bg-white">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        <div className="pb-12">
          <h1 className="md:pt-[50px] font-bold text-5xl leading-[1] mb-4">
            Shopping Cart
          </h1>
          <Link
            href={"/"}
            className=" text-gray-500 px-4 py-2 rounded-lg hover:underline"
          >
            Home
          </Link>
          <span className="inline-block p-1 mx-1 bg-gray-400 rounded-full"></span>
          <span className="text-gray-500"> Cart</span>
        </div>

        {cart.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            Your cart is empty!
          </div>
        ) : (
          <div className="lg:flex items-start gap-10">
            <table className="w-full lg:w-[70%] border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 text-left pl-4">Product</th>
                  <th className="py-3 text-left">Price</th>
                  <th className="py-3 text-left">Quantity</th>
                  <th className="py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {cart?.map((item: any) => (
                  <tr key={item.id} className="border-b border-b-gray-900">
                    <td className="flex items-center gap-4 p-4">
                      <Image
                        src={item.images[0]?.url}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        {item?.selectedOptions && (
                          <div className="text-sm text-gray-500">
                            {item?.selectedOptions?.color && (
                              <span>
                                Color: {}
                                <span
                                  style={{
                                    backgroundColor:
                                      item?.selectedOptions.color,
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "100%",
                                    display: "inline-block",
                                  }}
                                />
                              </span>
                            )}
                            {item?.selectedOptions.size && (
                              <span className="ml-2">
                                Size: {item?.selectedOptions.size}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 text-lg text-center">
                      {item?.id === discountedProductId ? (
                        <div className="flex flex-col items-center">
                          <span className="line-through text-gray-500 text-sm">
                            {item.sale_price.toFixed(2)}
                          </span>
                          <span className="text-green-600 font-semibold">
                            {(
                              (item.sale_price * (100 - discountPercent)) /
                              100
                            ).toFixed(2)}
                          </span>
                          <span className="text-xs text-green-700 bg-white">
                            Discount Applied
                          </span>
                        </div>
                      ) : (
                        <span>{item.sale_price.toFixed(2)}</span>
                      )}
                    </td>

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
                        className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-5 py-2 rounded-md transition-all"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-6 shadow-md w-full lg:w-[30%] bg-gray-100 rounded-lg">
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-gray-950 text-base font-medium pb-1">
                  <span>Discount ({discountPercent}%)</span>
                  <span className="text-green-600">
                    - {discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-lg text-gray-900 font-medium pb-3">
                <span>Subtotal</span>
                <span>Rs. {(subtotal - discountAmount).toFixed(2)}</span>
              </div>
              <hr className="my-4 text-slate-200" />

              <div className="mb-4">
                <h4 className="mb-2 font-medium text-sm">Have a coupon?</h4>
                <div className="flex">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e: any) => setCouponCode(e.target.value)}
                    placeholder="Enter a coupon code..."
                    className="w-full p-2 border-gray-200 rounded-l-md focus:outline-none focus:border-blue-500"
                  />

                  <button
                    className="bg-blue-500 cursor-pointer text-white px-4 rounded-r-md hover:bg-blue-600 transition-all"
                    // onClick={() => ""}
                  >
                    Apply
                  </button>
                  {/* {error && (
                    <p className="text-sm pt-2 text-red-600">{error}</p>
                  )} */}
                </div>
                <hr className="my-4 text-slate-200" />

                <div className="mb-4 ">
                  <h4 className="mb-2 font-medium text-sm">
                    Select Shipping Address
                  </h4>
                  {addresses?.length !== 0 && (
                    <select
                      className="w-full p-2 border-gray-200 border rounded-md focus:border-blue-500 focus:outline-none"
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                    >
                      {addresses?.map((address: any) => (
                        <option key={address.id} value={address.id}>
                          {address.label} - {address.city}, {address.country}
                        </option>
                      ))}
                    </select>
                  )}
                  {addresses?.length === 0 && (
                    <p className="text-sm text-slate-800">
                      Please add address from profile to create an order!
                    </p>
                  )}
                </div>
                <hr className="my-4 text-slate-200" />

                <div className="mb-4">
                  <h4 className="mb-2 font-medium text-sm">
                    Select Payment Method
                  </h4>
                  <select
                    value={selectedAddressId}
                    className="w-full p-2 border-gray-200 border rounded-md focus:border-blue-500 focus:outline-none"
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                  </select>
                </div>

                <hr className="my-4 text-slate-200" />

                <div className="flex justify-between items-center text-gray-950 text-sm font-medium pb-3">
                  <span>Rs. {(subtotal - discountAmount).toFixed(2)}</span>
                </div>

                <button
                  onClick={createPaymentSession}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 cursor-pointer mt-4 py-3 bg-gray-900 text-white hover:bg-blue-500 rounded transition-all"
                >
                  {loading && <Loader2 className="animate-spin w-5 h-5" />}
                  {loading ? "Redirecting..." : "Proceed to Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
