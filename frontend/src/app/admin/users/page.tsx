"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userAdminService } from "@/services/userAdmin.service";
import { AdminUser } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Users as UsersIcon,
    Shield,
    CheckCircle,
    XCircle,
    Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { AdminPagination } from "@/components/admin/AdminPagination";

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, roleFilter, statusFilter, currentPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params: any = {
                pageNum: currentPage,
                pageSize: pageSize,
            };
            if (searchTerm) params.search = searchTerm;
            if (roleFilter !== "all") params.role = roleFilter;
            if (statusFilter !== "all") params.status = statusFilter;

            const response = await userAdminService.getAll(params);
            if (response.code === 200) {
                setUsers(response.data);
                if (response.pagination) {
                    setTotalUsers(response.pagination.total);
                    setTotalPages(Math.ceil(response.pagination.total / pageSize));
                }
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    // Reset page when filters change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRoleFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="p-6 mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Users Management
                </h1>
                <p className="text-gray-600">
                    Manage user accounts and permissions
                </p>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-1 gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-10"
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={handleRoleChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {totalUsers}
                            </p>
                        </div>
                        <UsersIcon className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                {/* Note: These stats might be inaccurate with server-side pagination unless backend returns them separately. 
                    For now, I'll remove the filtered counts or keep them if I fetch stats separately. 
                    Since backend doesn't return aggregate stats, I will just show Total Users from pagination.
                    Or I can keep the cards but maybe remove the specific counts if I can't calculate them easily without fetching all.
                    Actually, let's just keep Total Users for now to be safe, or remove the other cards.
                    The original code calculated them from `users` array which was ALL users.
                    Now `users` is just one page.
                    I will remove the specific counts for now to avoid confusion.
                */}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Learning Paths
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Last Login
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <UsersIcon className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                                        <p className="text-lg font-medium text-gray-400">
                                            No users found
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <p className="font-semibold text-gray-900">
                                                    {user.name}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                    user.role === "admin"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "bg-blue-100 text-blue-700"
                                                )}
                                            >
                                                {user.role === "admin" && (
                                                    <Shield className="w-3 h-3 mr-1" />
                                                )}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-medium text-gray-700">
                                                {user.learningPathsCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                                                    user.status === "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                )}
                                            >
                                                {user.status === "active" ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Inactive
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="text-sm text-gray-600">
                                                {user.lastLoginAt
                                                    ? new Date(user.lastLoginAt).toLocaleDateString()
                                                    : "Never"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.push(`/admin/users/${user._id}`)
                                                    }
                                                    className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalUsers}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    loading={loading}
                />
            </div>
        </div>
    );
}
