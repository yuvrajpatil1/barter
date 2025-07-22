"use client";

import React, { useMemo, useState, useDeferredValue } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Search, Download, Ban, CheckCircle, XCircle, Eye } from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { saveAs } from "file-saver";
import Link from "next/link";
import axiosInstance from "@/shared/utils/axiosInstance";

type Seller = {
  id: string;
  name: string;
  email: string;
  businessName: string;
  phoneNumber: string;
  status: "active" | "banned" | "pending";
  isVerified: boolean;
  totalProducts: number;
  totalSales: number;
  createdAt: string;
};

type SellerResponse = {
  data: Seller[];
  meta: {
    totalSellers: number;
    totalPages: number;
  };
};

const SellersPage = () => {
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<
    "ban" | "unban" | "verify" | null
  >(null);
  const [page, setPage] = useState(1);
  const deferredGlobalFilter = useDeferredValue(globalFilter);
  const limit = 20;

  const queryClient = useQueryClient();

  const { data, isLoading }: UseQueryResult<SellerResponse, Error> = useQuery<
    SellerResponse,
    Error,
    SellerResponse,
    [string, number]
  >({
    queryKey: ["sellers-list", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-sellers?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const banSellerMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      await axiosInstance.put(`/admin/api/ban-seller/${sellerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers-list"] });
      setIsModalOpen(false);
      setSelectedSeller(null);
      setModalAction(null);
    },
  });

  const unbanSellerMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      await axiosInstance.put(`/admin/api/unban-seller/${sellerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers-list"] });
      setIsModalOpen(false);
      setSelectedSeller(null);
      setModalAction(null);
    },
  });

  const verifySellerMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      await axiosInstance.put(`/admin/api/verify-seller/${sellerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers-list"] });
      setIsModalOpen(false);
      setSelectedSeller(null);
      setModalAction(null);
    },
  });

  const allSellers = data?.data || [];
  const filteredSellers = useMemo(() => {
    return allSellers.filter((seller) => {
      const matchesStatus = statusFilter
        ? seller.status === statusFilter
        : true;
      const matchesVerification = verificationFilter
        ? verificationFilter === "verified"
          ? seller.isVerified
          : !seller.isVerified
        : true;
      const matchesGlobal = deferredGlobalFilter
        ? [seller.name, seller.email, seller.businessName, seller.phoneNumber]
            .join(" ")
            .toLowerCase()
            .includes(deferredGlobalFilter.toLowerCase())
        : true;
      return matchesStatus && matchesVerification && matchesGlobal;
    });
  }, [allSellers, statusFilter, verificationFilter, deferredGlobalFilter]);

  const totalPages = data?.meta?.totalPages ?? 0;
  const totalSellers = data?.meta?.totalSellers ?? 0;

  const exportToCSV = () => {
    const csvData = filteredSellers.map((seller) => ({
      Name: seller.name,
      Email: seller.email,
      "Business Name": seller.businessName,
      "Phone Number": seller.phoneNumber,
      Status: seller.status,
      Verified: seller.isVerified ? "Yes" : "No",
      "Total Products": seller.totalProducts,
      "Total Sales": seller.totalSales,
      "Joined Date": new Date(seller.createdAt).toLocaleDateString(),
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "sellers.csv");
  };

  const handleAction = (seller: Seller, action: "ban" | "unban" | "verify") => {
    setSelectedSeller(seller);
    setModalAction(action);
    setIsModalOpen(true);
  };

  const executeAction = () => {
    if (!selectedSeller || !modalAction) return;

    switch (modalAction) {
      case "ban":
        banSellerMutation.mutate(selectedSeller.id);
        break;
      case "unban":
        unbanSellerMutation.mutate(selectedSeller.id);
        break;
      case "verify":
        verifySellerMutation.mutate(selectedSeller.id);
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: "bg-green-100 text-green-800",
      banned: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusStyles[status as keyof typeof statusStyles] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Seller Name",
        cell: ({ row }: any) => (
          <div>
            <div className="font-medium text-white">{row.original.name}</div>
            <div className="text-sm text-gray-400">{row.original.email}</div>
          </div>
        ),
      },
      {
        accessorKey: "businessName",
        header: "Business",
        cell: ({ row }: any) => (
          <div>
            <div className="font-medium text-white">
              {row.original.businessName}
            </div>
            <div className="text-sm text-gray-400">
              {row.original.phoneNumber}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: "isVerified",
        header: "Verified",
        cell: ({ row }: any) => (
          <div className="flex items-center">
            {row.original.isVerified ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        ),
      },
      {
        accessorKey: "totalProducts",
        header: "Products",
        cell: ({ row }: any) => (
          <span className="text-blue-400 font-medium">
            {row.original.totalProducts}
          </span>
        ),
      },
      {
        accessorKey: "totalSales",
        header: "Sales",
        cell: ({ row }: any) => (
          <span className="text-green-400 font-medium">
            ${row.original.totalSales}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }: any) => (
          <span className="text-gray-400">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-2">
            <button
              className="text-blue-500 hover:text-blue-400"
              onClick={() => {
                /* Navigate to seller details */
              }}
              title="View Details"
            >
              <Eye size={16} />
            </button>
            {!row.original.isVerified && (
              <button
                className="text-green-500 hover:text-green-400"
                onClick={() => handleAction(row.original, "verify")}
                title="Verify Seller"
              >
                <CheckCircle size={16} />
              </button>
            )}
            {row.original.status === "active" ? (
              <button
                className="text-red-500 hover:text-red-400"
                onClick={() => handleAction(row.original, "ban")}
                title="Ban Seller"
              >
                <Ban size={16} />
              </button>
            ) : row.original.status === "banned" ? (
              <button
                className="text-yellow-500 hover:text-yellow-400"
                onClick={() => handleAction(row.original, "unban")}
                title="Unban Seller"
              >
                <CheckCircle size={16} />
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredSellers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const getModalContent = () => {
    if (!selectedSeller || !modalAction) return null;

    const actionText = {
      ban: "ban",
      unban: "unban",
      verify: "verify",
    }[modalAction];

    const actionColor = {
      ban: "red",
      unban: "yellow",
      verify: "green",
    }[modalAction];

    const mutation = {
      ban: banSellerMutation,
      unban: unbanSellerMutation,
      verify: verifySellerMutation,
    }[modalAction];

    return {
      title: `${
        actionText.charAt(0).toUpperCase() + actionText.slice(1)
      } Seller`,
      message: `Are you sure you want to ${actionText} ${selectedSeller.businessName} (${selectedSeller.name})?`,
      confirmText: `${
        actionText.charAt(0).toUpperCase() + actionText.slice(1)
      }`,
      color: actionColor,
      isPending: mutation.isPending,
    };
  };

  const modalContent = getModalContent();

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            All Sellers
          </h1>
          <nav className="text-sm">
            <Link href="/dashboard" className="text-blue-400 hover:underline">
              Dashboard
            </Link>
            <span className="text-gray-400 mx-2">›</span>
            <span className="text-gray-300">All Sellers</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"
          >
            <Download size={16} />
            Export CSV
          </button>
          <select
            className="bg-gray-800 border border-gray-700 outline-none text-white rounded px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="pending">Pending</option>
          </select>
          <select
            className="bg-gray-800 border border-gray-700 outline-none text-white rounded px-3 py-2"
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
          >
            <option value="">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center bg-gray-900 p-3 rounded-md">
          <Search size={18} className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search sellers, business names, emails..."
            className="w-full bg-transparent text-white outline-none placeholder-gray-400"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-white">{totalSellers}</div>
          <div className="text-gray-400 text-sm">Total Sellers</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-400">
            {allSellers.filter((s) => s.status === "active").length}
          </div>
          <div className="text-gray-400 text-sm">Active</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">
            {allSellers.filter((s) => s.isVerified).length}
          </div>
          <div className="text-gray-400 text-sm">Verified</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">
            {allSellers.filter((s) => s.status === "pending").length}
          </div>
          <div className="text-gray-400 text-sm">Pending</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading sellers...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
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
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
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
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {page} of {totalPages || 1} ({totalSellers} total sellers)
          </span>
          <button
            className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Action confirmation modal */}
      {isModalOpen && selectedSeller && modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-[#1e293b] rounded-2xl shadow-lg w-[90%] max-w-md p-6 relative">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-white text-lg font-semibold">
                {modalContent.title}
              </h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-300 leading-6">
                <span className="text-yellow-400 font-semibold">
                  Important:
                </span>{" "}
                {modalContent.message}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedSeller(null);
                  setModalAction(null);
                }}
                className="px-4 py-2 bg-gray-700 text-sm text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={modalContent.isPending}
                className={`px-4 py-2 bg-${modalContent.color}-600 hover:bg-${modalContent.color}-700 text-sm text-white rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {modalAction === "ban" && <Ban size={16} />}
                {modalAction === "verify" && <CheckCircle size={16} />}
                {modalAction === "unban" && <CheckCircle size={16} />}
                {modalContent.isPending
                  ? "Processing..."
                  : modalContent.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellersPage;
