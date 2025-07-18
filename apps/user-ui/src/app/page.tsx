"use client";
import React from "react";
import ProductCard from "@/shared/components/cards/product-card";
import ShopCard from "@/shared/components/cards/shop-card";
import SectionTitle from "@/shared/components/section/section-title";
import Hero from "@/shared/modules/hero";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

function Page() {
  const {
    data: products,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=10"
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: latestProducts, isLoading: isLatestLoading } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=10&type=latest"
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: shops, isLoading: isShopsLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/top-shops");
      console.log(res.data.shops);
      return res.data.shops;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: offers, isLoading: isOffersLoading } = useQuery({
    queryKey: ["event-offers"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-events?page=1&limit=10"
      );
      return res.data.offers;
    },
    staleTime: 1000 * 60 * 2,
  });

  const renderSkeletons = (count: number) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
        />
      ))}
    </div>
  );

  const renderProductGrid = (items: any[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );

  return (
    <div className="bg-[#f5f5f5]">
      <Hero />
      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        {/* Suggested Products */}
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>
        {isProductsLoading && renderSkeletons(10)}
        {!isProductsLoading &&
          !isProductsError &&
          products?.length > 0 &&
          renderProductGrid(products)}
        {!isProductsLoading && products?.length === 0 && (
          <p className="text-center">No Products Available.</p>
        )}
        {isProductsError && (
          <p className="text-center text-red-500">Failed to load products.</p>
        )}

        {/* Latest Products */}
        <div className="my-8 block">
          <SectionTitle title="Latest Products" />
        </div>
        {isLatestLoading && renderSkeletons(10)}
        {!isLatestLoading &&
          latestProducts?.length > 0 &&
          renderProductGrid(latestProducts)}
        {!isLatestLoading && latestProducts?.length === 0 && (
          <p className="text-center">No Latest Products Available.</p>
        )}

        {/* Top Shops */}
        <div className="my-8 block">
          <SectionTitle title="Top Shops" />
        </div>
        {isShopsLoading && renderSkeletons(5)}
        {!isShopsLoading && shops?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {shops.map((shop: any) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
        {!isShopsLoading && shops?.length === 0 && (
          <p className="text-center">No Shops Available.</p>
        )}

        {/* Top Offers */}
        <div className="my-8 block">
          <SectionTitle title="Top Offers" />
        </div>
        {isOffersLoading && renderSkeletons(8)}
        {!isOffersLoading && offers?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {offers.map((product: any) => (
              <ProductCard key={product.id} product={product} isEvent />
            ))}
          </div>
        )}
        {!isOffersLoading && offers?.length === 0 && (
          <p className="text-center">No Offers Available.</p>
        )}
      </div>
    </div>
  );
}

export default Page;
