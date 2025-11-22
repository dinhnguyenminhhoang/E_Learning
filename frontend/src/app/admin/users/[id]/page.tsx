"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { userAdminService } from "@/services/userAdmin.service";
import { AdminUser } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Shield, Calendar, Activity } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function UserDetailPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<AdminUser | null>(null);

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await userAdminService.getById(userId);
            if (response.code === 200 && response.data) {
                setUser(response.data);
            } else {
                toast.error("User not found");
                router.push("/admin/users");
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            toast.error("Failed to load user");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!user) return;
        const newStatus = user.status === "active" ? "inactive" : "active";

        try {
            const response = await userAdminService.update(userId, {
                status: newStatus,
            });
            if (response.code === 200) {
                toast.success(`User ${newStatus === "active" ? "activated" : "deactivated"}`);
                fetchUser();
            }
        } catch (error) {
            toast.error("Failed to update user status");
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Users
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">User Details</h1>
                <p className="text-gray-600">View and manage user information</p>
            </div>

            {/* User Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{user.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleToggleStatus}
                            className={cn(
                                user.status === "active"
                                    ? "text-red-600 hover:bg-red-50"
                                    : "text-green-600 hover:bg-green-50"
                            )}
                        >
                            {user.status === "active" ? "Deactivate" : "Activate"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-medium text-gray-500 uppercase">Role</span>
                        </div>
                        <p
                            className={cn(
                                "text-lg font-semibold capitalize",
                                user.role === "admin" ? "text-purple-700" : "text-blue-700"
                            )}
                        >
                            {user.role}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
                        </div>
                        <p
                            className={cn(
                                "text-lg font-semibold capitalize",
                                user.status === "active" ? "text-green-700" : "text-gray-500"
                            )}
                        >
                            {user.status}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-gray-500 uppercase">Joined</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Learning Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">{user.learningPathsCount}</p>
                        <p className="text-sm text-gray-600 mt-1">Learning Paths</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">0</p>
                        <p className="text-sm text-gray-600 mt-1">Completed Lessons</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600">0</p>
                        <p className="text-sm text-gray-600 mt-1">Quiz Attempts</p>
                    </div>
                </div>
            </div>

            {/* Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Last Login</span>
                        <span className="text-sm font-medium text-gray-900">
                            {user.lastLoginAt
                                ? new Date(user.lastLoginAt).toLocaleString()
                                : "Never"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t">
                        <span className="text-sm text-gray-600">Account Created</span>
                        <span className="text-sm font-medium text-gray-900">
                            {new Date(user.createdAt).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
