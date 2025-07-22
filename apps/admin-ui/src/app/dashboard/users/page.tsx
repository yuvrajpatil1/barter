"use client";

import React, { useMemo, useState, useDeferredValue } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Search, Download, Ban } from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { saveAs } from "file-saver";
import Link from "next/link";
import axiosInstance from "@/shared/utils/axiosInstance";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type UserResponse = {
  data: User[];
  meta: {
    totalUsers: number;
    totalPages: number;
  };
};

const UsersPage = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const deferredGlobalFilter = useDeferredValue(globalFilter);
  const limit = 20; // Match the controller's default limit

  const queryClient = useQueryClient();

  const { data, isLoading }: UseQueryResult<UserResponse, Error> = useQuery<
    UserResponse,
    Error,
    UserResponse,
    [string, number]
  >({
    queryKey: ["users-list", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-users?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.put(`/admin/api/ban-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      setIsModalOpen(false);
      setSelectedUser(null);
    },
  });

  const allUsers = data?.data || [];
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesRole = roleFilter ? user.role === roleFilter : true;
      const matchesGlobal = deferredGlobalFilter
        ? [user.name, user.email, user.role]
            .join(" ")
            .toLowerCase()
            .includes(deferredGlobalFilter.toLowerCase())
        : true;
      return matchesRole && matchesGlobal;
    });
  }, [allUsers, roleFilter, deferredGlobalFilter]);

  const totalPages = data?.meta?.totalPages ?? 0;
  const totalUsers = data?.meta?.totalUsers ?? 0;

  // Export CSV functionality
  const exportToCSV = () => {
    const csvData = filteredUsers.map((user) => ({
      Name: user.name,
      Email: user.email,
      Role: user.role,
      "Joined Date": new Date(user.createdAt).toLocaleDateString(),
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "users.csv");
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }: any) => <span>{row.original.name}</span>,
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }: any) => (
          <span className="uppercase font-semibold text-blue-400">
            {row.original.role}
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
          <button
            className="text-red-500 ml-3 text-sm text-center w-full"
            onClick={() => {
              setSelectedUser(row.original);
              setIsModalOpen(true);
            }}
          >
            <Ban size={20} />
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-2">All Users</h1>
          <nav className="text-sm">
            <Link href="/dashboard" className="text-blue-400 hover:underline">
              Dashboard
            </Link>
            <span className="text-gray-400 mx-2">›</span>
            <span className="text-gray-300">All Users</span>
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center bg-gray-900 p-3 rounded-md">
          <Search size={18} className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full bg-transparent text-white outline-none placeholder-gray-400"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading users...</p>
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
            Page {page} of {totalPages || 1} ({totalUsers} total users)
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

      {/* Ban confirmation modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-[#1e293b] rounded-2xl shadow-lg w-[90%] max-w-md p-6 relative">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-white text-lg font-semibold">Ban User</h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-300 leading-6">
                <span className="text-yellow-400 font-semibold">
                  Important:
                </span>{" "}
                Are you sure you want to ban{" "}
                <span className="text-red-400 font-medium">
                  {selectedUser.name}
                </span>
                ? This action can be reverted later.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-700 text-sm text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => banUserMutation.mutate(selectedUser.id)}
                disabled={banUserMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-sm text-white rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Ban size={16} />
                {banUserMutation.isPending ? "Banning..." : "Confirm Ban"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
