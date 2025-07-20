"use client";

import React from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

const OrdersTable = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/api/get-user-orders`);
      return res.data.orders;
    },
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: (info: any) => info.getValue()?.slice(-6),
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "total",
      header: "Total (Rs.)",
      cell: (info: any) => `Rs. ${info.getValue()?.toFixed(2)}`,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }: any) =>
        new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <button
          onClick={() => router.push(`/order/${row.original.id}`)}
          className="text-blue-600 hover:underline text-xs flex items-center gap-1"
        >
          Track Order <ArrowUpRight size={18} />
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading)
    return <p className="text-sm text-gray-600">Loading orders...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-b-gray-200 text-left"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="py-2 px-3 font-semibold text-gray-700"
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
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-b-gray-200 hover:bg-gray-50"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-2 px-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data?.length === 0 && (
        <p className="text-center h-[30vh] items-center flex justify-center">
          No orders available yet!
        </p>
      )}
    </div>
  );
};

export default OrdersTable;
