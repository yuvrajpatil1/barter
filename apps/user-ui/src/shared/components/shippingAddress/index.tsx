"use client";
import axiosInstance from "@/utils/axiosInstance";
import { countries } from "@/utils/countries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const ShippingAddressSection = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: "Home",
      name: "",
      street: "",
      zip: "",
      city: "",
      country: "",
      isDefault: "false",
    },
  });

  const { mutate: addAddress, isPending: isAddingAddress } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosInstance.post("/api/add-address", payload);
      return res.data.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
      reset();
      setShowModal(false);
    },
    onError: (error) => {
      console.error("Error adding address:", error);
      // You might want to show a toast notification here
    },
  });

  // Get addresses - Fixed query key to match invalidation
  const { data: addresses, isLoading } = useQuery({
    queryKey: ["shipping-addresses"], // Fixed: was "shipping-address"
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
  });

  const onSubmit = async (data: any) => {
    addAddress({
      ...data,
      isDefault: data?.isDefault === "true",
    });
  };

  const { mutate: deleteAddress, isPending: isDeletingAddress } = useMutation({
    mutationFn: async (id: string) => {
      console.log("Attempting to delete address with ID:", id);
      console.log("Full URL:", `/api/delete-address/${id}`);

      const res = await axiosInstance.delete(`/api/delete-address/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
    },
    onError: (error: any) => {
      console.error("Error deleting address:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      // You might want to show a toast notification here
    },
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Saved Addresses</h2>
        <button
          className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-4 h-4" /> Add new address {/* Fixed typo */}
        </button>
      </div>

      {/* Address list */}
      <div>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading Addresses...</p>
        ) : !addresses || addresses.length === 0 ? (
          <p className="text-sm text-gray-500">No Saved Addresses Found!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((address: any) => (
              <div
                key={address.id}
                className="border border-gray-200 rounded-md p-4 relative"
              >
                {address.isDefault && (
                  <span className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}

                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="w-5 h-5 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {address.label} - {address.name}
                    </p>
                    <p>
                      {address.street}, {address.city}, {address.zip},{" "}
                      {address.country}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    className="flex items-center gap-1 cursor-pointer text-xs text-red-500 disabled:opacity-50"
                    onClick={() => deleteAddress(address.id)}
                    disabled={isDeletingAddress}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-md shadow-md relative">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-500"
              onClick={() => setShowModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add new address
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {" "}
              {/* Fixed: was onClick */}
              <select {...register("label")} className="form-input">
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
              <input
                placeholder="Name"
                {...register("name", { required: "Name is required!" })}
                className="form-input"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
              <input
                placeholder="Street"
                {...register("street", { required: "Street is required!" })}
                className="form-input"
              />
              {errors.street && (
                <p className="text-red-500 text-xs">{errors.street.message}</p>
              )}
              <input
                placeholder="City"
                {...register("city", { required: "City is required!" })}
                className="form-input"
              />
              {errors.city && (
                <p className="text-red-500 text-xs">{errors.city.message}</p>
              )}
              <input
                placeholder="Zip Code"
                {...register("zip", { required: "Zip Code is required!" })}
                className="form-input"
              />
              {errors.zip && (
                <p className="text-red-500 text-xs">{errors.zip.message}</p>
              )}
              <select
                {...register("country", { required: "Country is required!" })}
                className="form-input"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.name} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-red-500 text-xs">{errors.country.message}</p>
              )}
              <select {...register("isDefault")} className="form-input">
                <option value="false">Not default</option>
                <option value="true">Set as default</option>
              </select>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-800 transition disabled:opacity-50"
                disabled={isAddingAddress}
              >
                {isAddingAddress ? "Saving..." : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddressSection;
