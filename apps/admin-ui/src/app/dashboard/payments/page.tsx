"use client";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Search, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import axiosInstance from "@/shared/utils/axiosInstance";

const fetchOrders = async () => {
  const res = await axiosInstance.get("/order/api/get-order-details");
  return res.data.orders;
};

const PaymentsTable = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }: any) => (
          <span className="text-white text-sm truncate">
            #{row.original.id.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "shop.name",
        header: "Shop",
        cell: ({ row }: any) => (
          <span className="text-white">
            #{row.original.shop?.name ?? "Unknown Shop"}
          </span>
        ),
      },
      {
        accessorKey: "user.name",
        header: "Buyer",
        cell: ({ row }: any) => (
          <span className="text-white">
            #{row.original.user?.name ?? "Guest"}
          </span>
        ),
      },
      {
        header: "Admin Fee (10%)",
        cell: ({ row }: any) => {
          const adminFee = row.original.total * 0.1;
          return (
            <span className="text-green-400 font-semibold">
              Rs. {adminFee.toFixed(2)}
            </span>
          );
        },
      },
      {
        header: "Seller Earnings",
        cell: ({ row }: any) => {
          const sellerEarnings = row.original.total * 0.9;
          return (
            <span className="text-green-400 font-semibold">
              Rs. {sellerEarnings.toFixed(2)}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Payment Status",
        cell: ({ row }: any) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.original.status === "Paid"
                ? "bg-gray-600 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }: any) => {
          const date = new Date(row.original.createdAt).toLocaleDateString();
          return <span className="text-white text-sm">{date}</span>;
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <Link
            href={`/order/${row.original.id}`}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            <Eye size={18} />
          </Link>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });
  return (
    <div className="w-full min-h-screen p-8">
      {/* Heading and Breadcrumbs */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl py-2 font-semibold text-white">All Payments</h2>
      </div>

      {/* Search bAR */}
      <div className="my-2 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search orders..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading payments...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left text-sm">
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
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:border-gray-900 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 text-sm">
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
        )}

        {!isLoading && orders?.length === 0 && (
          <p className="text-center py-3 text-white">No Payments found!</p>
        )}
      </div>
    </div>
  );
};

export default PaymentsTable;
