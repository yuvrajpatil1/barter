"use client";
import React, { useDeferredValue, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Search, Download, Eye, Calendar } from "lucide-react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import Link from "next/link";
import { saveAs } from "file-saver";
import axiosInstance from "@/shared/utils/axiosInstance";
import Image from "next/image";

const EventsPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredFilter = useDeferredValue(globalFilter);
  const [page, setPage] = useState(1);
  const limit = 20; // Match the controller's default limit

  const { data, isLoading } = useQuery({
    queryKey: ["all-events", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-events?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const allEvents = data?.data || [];
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event: any) =>
      Object.values(event)
        .join(" ")
        .toLowerCase()
        .includes(deferredFilter.toLowerCase())
    );
  }, [allEvents, deferredFilter]);

  const totalPages = data?.meta?.totalPages ?? 0;
  const totalEvents = data?.meta?.totalEvents ?? 0;

  // Export CSV functionality
  const exportToCSV = () => {
    const csvData = filteredEvents.map((event: any) => ({
      Title: event.title,
      Price: event.sale_price,
      Stock: event.stock,
      Start: event.starting_date,
      End: event.ending_date,
      Shop: event.Shop?.name ?? "Unknown Shop",
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map((row: any) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "events.csv");
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => {
          return (
            <Image
              src={row.original.images[0]?.url || "/placeholder-image.jpg"}
              alt={row.original.title}
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
      {
        accessorKey: "starting_date",
        header: "Start",
        cell: ({ row }: any) =>
          new Date(row.original.starting_date).toLocaleDateString(),
      },
      {
        accessorKey: "ending_date",
        header: "End",
        cell: ({ row }: any) =>
          new Date(row.original.ending_date).toLocaleDateString(),
      },
      {
        accessorKey: "Shop.name",
        header: "Shop",
        cell: ({ row }: any) => (
          <span className="text-purple-400">
            {row.original.Shop?.name ?? "Unknown Shop"}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredEvents,
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
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={24} className="text-blue-400" />
            <h1 className="text-2xl font-semibold text-white">All Events</h1>
          </div>
          <nav className="text-sm">
            <Link href="/dashboard" className="text-blue-400 hover:underline">
              Dashboard
            </Link>
            <span className="text-gray-400 mx-2">›</span>
            <span className="text-gray-300">All Events</span>
          </nav>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredEvents.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <span className="text-gray-400">Total Events: </span>
              <span className="text-white font-medium">{totalEvents}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Showing: </span>
              <span className="text-white font-medium">
                {filteredEvents.length}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center bg-gray-900 p-3 rounded-md">
          <Search size={18} className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full bg-transparent text-white outline-none placeholder-gray-400"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-white">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="animate-pulse" size={20} />
              Loading events...
            </div>
          </div>
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
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, totalEvents)} of {totalEvents} events
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {!isLoading && filteredEvents.length === 0 && (
          <div className="p-8 text-center text-white">
            <Calendar size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-lg mb-2">No events found!</p>
            <p className="text-gray-400 text-sm">
              {globalFilter
                ? "Try adjusting your search criteria."
                : "There are currently no events available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
