"use client";
import React, { useDeferredValue, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Search, Download, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { saveAs } from "file-saver";
import axiosInstance from "@/shared/utils/axiosInstance";
import Image from "next/image";

const ProductsPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredFilter = useDeferredValue(globalFilter);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["all-products", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-products?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const allProducts = data?.data || [];
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product: any) =>
      Object.values(product)
        .join(" ")
        .toLowerCase()
        .includes(deferredFilter.toLowerCase())
    );
  }, [allProducts, deferredFilter]);

  const totalPages = data?.meta?.totalPages ?? 0;

  // Export CSV functionality
  const exportToCSV = () => {
    const csvData = filteredProducts.map((product: any) => ({
      Title: product.title,
      Price: product.sale_price,
      Stock: product.stock,
      Category: product.category,
      Rating: product.rating,
      Shop: product.shop?.name ?? "Unknown Shop",
      Created: new Date(product.createdAt).toLocaleDateString(),
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map((row: any) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "products.csv");
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => {
          return (
            <Image
              src={row.original.images[0]?.url}
              alt={row.original.images[0]?.url}
              width={200}
              height={200}
              className="w-12 h-12 rounded-md object-cover"
            />
          );
        },
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;
          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "sale_price",
        header: "Price",
        cell: ({ row }: any) => <span>${row.original.sale_price}</span>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span
            className={row.original.stock < 10 ? "text-red-500" : "text-white"}
          >
            {row.original.stock} left
          </span>
        ),
      },
      { accessorKey: "category", header: "Category" },
      {
        accessorKey: "rating",
        header: "Rating",
      },
      {
        accessorKey: "shop.name",
        header: "Shop",
        cell: ({ row }: any) => (
          <span className="text-purple-400">
            {row.original.shop?.name ?? "Unknown Shop"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }: any) => {
          const date = new Date(row.original.createdAt).toLocaleDateString();
          return <span className="text-white text-sm">{date}</span>;
        },
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
          <Link
            href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
            className="text-blue-400 hover:text-blue-300"
          >
            <Eye size={16} />
          </Link>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-8 bg-gray-950">
      {/* Heading and Export Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            All Products
          </h1>
          <nav className="text-sm">
            <Link href="/dashboard" className="text-blue-400 hover:underline">
              Dashboard
            </Link>
            <span className="text-gray-400 mx-2">›</span>
            <span className="text-gray-300">All Products</span>
          </nav>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center bg-gray-900 p-3 rounded-md">
          <Search size={18} className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full bg-transparent text-white outline-none placeholder-gray-400"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-white">Loading products...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead className="bg-gray-800">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="p-4 text-left text-sm font-medium text-gray-300"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-800 hover:bg-gray-800 transition-colors ${
                        index % 2 === 0 ? "bg-gray-900" : "bg-gray-850"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-4 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center p-4 border-t border-gray-800">
              <div className="text-gray-400 text-sm">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="p-8 text-center text-white">No products found!</div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
