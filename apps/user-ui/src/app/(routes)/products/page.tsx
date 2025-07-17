"use client";
import ProductCard from "@/shared/components/cards/product-card";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Range } from "react-range";

const MIN = 0;
const MAX = 999999;

const Page = () => {
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 999999]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([0, 999999]);

  const colors = [
    { code: "#000000", name: "Black" },
    { code: "#ffffff", name: "White" },
    { code: "#ff0000", name: "Red" },
    { code: "#00ff00", name: "Green" },
    { code: "#0000ff", name: "Blue" },
    { code: "#ffff00", name: "Yellow" },
    { code: "#ff00ff", name: "Magenta" },
    { code: "#00ffff", name: "Cyan" },
    { code: "#ffa500", name: "Orange" },
    { code: "#800080", name: "Purple" },
    { code: "#ffc0cb", name: "Pink" },
    { code: "#a52a2a", name: "Brown" },
    { code: "#808080", name: "Gray" },
    { code: "#90ee90", name: "Light Green" },
    { code: "#ff69b4", name: "Hot Pink" },
    { code: "#4169e1", name: "Royal Blue" },
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

  const router = useRouter();
  const updateURL = () => {
    const params = new URLSearchParams();
    params.set("priceRange", priceRange.join(","));
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }
    if (selectedColors.length > 0) {
      params.set("colors", selectedColors.join(","));
    }
    if (selectedSizes.length > 0) {
      params.set("sizes", selectedSizes.join(","));
    }
    params.set("page", page.toString());

    router.replace(`/products?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredProducts = async () => {
    setIsProductLoading(true);

    try {
      const query = new URLSearchParams();

      query.set("priceRange", priceRange.join(","));

      if (selectedCategories.length > 0) {
        query.set("categories", selectedCategories.join(","));
      }
      if (selectedColors.length > 0) {
        query.set("colors", selectedColors.join(","));
      }
      if (selectedSizes.length > 0) {
        query.set("sizes", selectedSizes.join(","));
      }
      query.set("page", page.toString());
      query.set("limit", "12");

      const res = await axiosInstance.get(
        `/product/api/get-filtered-products?${query.toString()}`
      );

      setProducts(res.data.products);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.log(error);
    } finally {
      setIsProductLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedColors, selectedSizes, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat) => cat !== label)
        : [...prev, label]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="w-full bg-white pb-10">
      <div className="w-[90%] lg:w-[80%] m-auto">
        <div className="pb-[50px]">
          <h1 className="md:pt-[40px] font-medium text-3xl leading-1 mb-4">
            All Products
          </h1>
          <Link href="/" className="text-gray-600 hover:underline">
            Home
          </Link>
          <span className="inline-block p-1 mx-1 bg-gray-600 rounded-full"></span>
          <span className="text-gray-700">All Products</span>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* sidebar */}
          <aside className="w-full lg:w-[270px] rounded bg-white p-4 space-y-6 shadow-lg">
            <h3 className="text-xl font-medium">Price Filter</h3>

            <div className="ml-2">
              <Range
                step={1}
                min={MIN}
                max={MAX}
                values={tempPriceRange}
                onChange={(values) => setTempPriceRange(values)}
                renderTrack={({ props, children }) => {
                  const [min, max] = tempPriceRange;
                  const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                  const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;

                  return (
                    <div
                      {...props}
                      className="h-2 bg-blue-200 rounded relative"
                      style={{ ...props.style }}
                    >
                      <div
                        className="absolute h-full bg-blue-600 rounded"
                        style={{
                          left: `${percentageLeft}%`,
                          width: `${percentageRight - percentageLeft}%`,
                        }}
                      />
                      {children}
                    </div>
                  );
                }}
                renderThumb={({ props }) => {
                  const { key, ...rest } = props;
                  return (
                    <div
                      key={key}
                      {...rest}
                      className="w-4 h-4 bg-blue-600 rounded-full shadow"
                    />
                  );
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-600">
                {tempPriceRange[0]} - {tempPriceRange[1]}
              </div>
              <button
                onClick={() => {
                  setPriceRange(tempPriceRange);
                  setPage(1);
                }}
                className="text-sm px-4 py-1 bg-gray-200 hover:bg-blue-600 hover:text-white transition rounded"
              >
                Apply
              </button>
            </div>

            {/* Categories filter */}
            <h3 className="text-xl font-medium border-b border-b-slate-300 pb-1">
              Categories
            </h3>
            <ul className="space-y-2 mt-3">
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                data?.categories?.map((category: any) => (
                  <li
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="accent-blue-600"
                      />
                      {category}
                    </label>
                  </li>
                ))
              )}
            </ul>

            {/* Colors */}
            <h3 className="text-xl font-medium border-b border-b-slate-300 pb-1 mt-6">
              Filter by Color
            </h3>
            <ul className="space-y-2 mt-3">
              {colors.map((color) => (
                <li
                  key={color.name}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color.name)}
                      onChange={() => toggleColor(color.name)}
                      className="accent-blue-600"
                    />

                    <span
                      className="w-4 h-4 rounded-full border border-gray-400"
                      style={{ backgroundColor: color.code }}
                    ></span>
                    {color.name}
                  </label>
                </li>
              ))}
            </ul>

            {/* Sizes */}
            <h3 className="text-xl font-medium border-b border-b-slate-300 pb-1 mt-6">
              Filter by Size
            </h3>
            <ul className="space-y-2 mt-3">
              {sizes.map((size) => (
                <li key={size} className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => toggleSize(size)}
                      className="accent-blue-600"
                    />

                    <span className="font-medium">{size}</span>
                  </label>
                </li>
              ))}
            </ul>
          </aside>

          {/* product grid */}
          <div className="flex-1 px-2 lg:px-3">
            {isProductLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p>No Products Found!</p>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded border border-gray-200 text-sm ${
                      page === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-white text-black"
                    } `}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
