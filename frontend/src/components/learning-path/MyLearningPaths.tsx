"use client";

import { useState, useEffect } from "react";
import { LearningPathCard } from "./LearningPathCard";
import { AddLearningPathDialog } from "./AddLearningPathDialog";
import { userLearningPathService } from "@/services/userLearningPath.service";
import { toast } from "react-hot-toast";
import { BookOpen } from "lucide-react";

export function MyLearningPaths() {
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingPathId, setSwitchingPathId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserPaths();
  }, []);

  const fetchUserPaths = async () => {
    try {
      setLoading(true);
      const response = await userLearningPathService.getAllUserPaths();

      if (response.code === 200 && response.data) {
        const sortedPaths = response.data.sort((a: any, b: any) => {
          if (a.status === "active" && b.status !== "active") return -1;
          if (a.status !== "active" && b.status === "active") return 1;
          return 0;
        });
        setPaths(sortedPaths);
      }
    } catch (error) {
      console.error("Error fetching paths:", error);
      toast.error("Không thể tải danh sách lộ trình");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchPath = async (pathId: string) => {
    try {
      setSwitchingPathId(pathId);
      const response = await userLearningPathService.switchActivePath(pathId);

      if (response.code === 200) {
        toast.success("Chuyển đổi lộ trình thành công!");
        window.location.replace(
          `${window.location.pathname}?refresh=${Date.now()}`
        );
      } else {
        toast.error(response.message || "Chuyển đổi lộ trình thất bại");
      }
    } catch (error: any) {
      console.error("Error switching path:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSwitchingPathId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const enrolledPathIds = paths.map((p) => p.learningPath._id);

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Lộ trình của tôi
          </h2>
          <p className="text-gray-600">
            Quản lý và chuyển đổi giữa các lộ trình học
          </p>
        </div>
        <AddLearningPathDialog
          enrolledPathIds={enrolledPathIds}
          onSuccess={fetchUserPaths}
        />
      </div>

      {paths.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Chưa có lộ trình nào
          </h3>
          <p className="text-gray-600 mb-6">
            Đăng ký lộ trình đầu tiên để bắt đầu học
          </p>
          <AddLearningPathDialog
            enrolledPathIds={[]}
            onSuccess={fetchUserPaths}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path) => (
            <LearningPathCard
              key={path._id}
              path={path}
              totalLessons={100}
              onSwitch={handleSwitchPath}
              isLoading={switchingPathId === path.learningPath._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
