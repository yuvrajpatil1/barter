"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/shared/utils/axiosInstance";

const statuses = [
  "Ordered",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
];

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await axiosInstance.get(
        `/order/api/get-order-details/${orderId}`
      );
      setOrder(res.data.order);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch order details.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value;
    setUpdating(true);

    try {
      const res = await axiosInstance.put(
        `/order/api/update-delivery-status/${orderId}`,
        { deliveryStatus: newStatus }
      );

      if (res.data.success) {
        setOrder({ ...order, deliveryStatus: newStatus });
      }
    } catch (err) {
      console.error("Failed to update delivery status.", err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <Loader2 className="animate-spin w-6 h-6 text-gray-600" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-sm text-red-500">Order not found.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="my-4">
        <span
          className="text-white flex items-center gap-2 font-semibold cursor-pointer hover:text-gray-300 transition-colors"
          onClick={() => router.push("/dashboard/orders")}
        >
          <ArrowLeft /> Go Back to Dashboard.
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-200 mb-4">
        Order #{order.id.slice(-6)}
      </h1>

      {/* Status selector */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-300 mr-3">
          Update Delivery Status:
        </label>
        <select
          value={order.deliveryStatus}
          onChange={handleStatusChange}
          disabled={updating}
          className="border bg-transparent text-gray-200 border-gray-300 rounded-md px-3 py-2"
        >
          {statuses.map((status) => {
            const currentIndex = statuses.indexOf(order.deliveryStatus);
            const statusIndex = statuses.indexOf(status);

            return (
              <option
                key={status}
                value={status}
                disabled={statusIndex < currentIndex}
                className="bg-gray-800"
              >
                {status}
              </option>
            );
          })}
        </select>
      </div>

      {/* Delivery progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
          {statuses.map((step, idx) => {
            const current = step === order.deliveryStatus;
            const passed = statuses.indexOf(order.deliveryStatus) >= idx;
            return (
              <div
                key={step}
                className={`flex-1 text-left ${
                  current
                    ? "text-blue-600"
                    : passed
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {step}
              </div>
            );
          })}
        </div>

        <div className="flex items-center">
          {statuses.map((step, idx) => {
            const currentStatusIndex = statuses.findIndex(
              (s) => s === order.deliveryStatus
            );
            const isReached = idx <= currentStatusIndex;

            return (
              <div key={step} className="flex-1 flex items-center">
                <div
                  className={`w-4 h-4 rounded-full ${
                    isReached ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
                {idx !== statuses.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      isReached ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Info */}
      <div className="mb-6 space-y-1 text-sm text-gray-200">
        <p>
          <span className="font-semibold">Payment Status: </span>
          <span className="text-green-600 font-medium">{order.status}</span>
        </p>
        <p>
          <span className="font-semibold">Total Paid: </span>
          <span className="text-gray-600 font-medium">
            Rs. {order.total.toFixed(2)}
          </span>
        </p>

        {order.discountAmount > 0 && (
          <p>
            <span className="font-semibold">Discount Applied: </span>
            <span className="text-green-400">
              -Rs. {order.discountAmount.toFixed(2)} (
              {order.couponCode?.discountType === "percentage"
                ? `${order.couponCode.discountValue}%`
                : `Rs. ${order.couponCode.discountValue}`}{" "}
              off )
            </span>
          </p>
        )}

        {order.couponCode && (
          <p>
            <span className="font-semibold">Coupon Used: </span>
            <span className="text-blue-400">
              {order.couponCode.public_name}
            </span>
          </p>
        )}
        <p>
          <span className="font-semibold">Date: </span>
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Shipping address */}
      {order.shippingAddress && (
        <div className="mb-6 text-sm text-gray-200">
          <h2 className="text-md font-semibold mb-2">Shipping Address</h2>
          <p>{order.shippingAddress.name}</p>
          <p>
            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.zip}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>
      )}

      {/* Order items */}
      <div>
        <h2 className="text-lg font-semibold text-gray-200 mb-4">
          Order Items
        </h2>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div
              key={item.productId}
              className="border border-gray-200 rounded-md p-4 flex items-center gap-2"
            >
              <img
                src={item.product.images[0]?.url}
                alt={item.product?.title}
                className="w-16 h-16 object-cover rounded-md border border-gray-200"
              />

              <div className="flex-1">
                <p className="font-medium text-gray-200">
                  {item.product?.title || "Unnamed Product"}
                </p>
                <p className="text-sm text-gray-300">
                  Quantity: {item.quantity}
                </p>

                {item.selectedOptions &&
                  Object.keys(item.selectedOptions).length > 0 && (
                    <div className="text-xs text-gray-200 mt-1">
                      {Object.entries(item.selectedOptions).map(
                        ([key, value]: [string, any]) =>
                          value && (
                            <span
                              key={key}
                              className="mr-3 flex gap-2 items-center"
                            >
                              <span className="font-medium capitalize">
                                {key}:
                              </span>
                              <span
                                className="w-3 h-3 rounded-full block"
                                style={{ backgroundColor: value }}
                              ></span>
                            </span>
                          )
                      )}
                    </div>
                  )}
              </div>
              <p className="text-sm font-semibold text-gray-200">
                Rs. {item.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
