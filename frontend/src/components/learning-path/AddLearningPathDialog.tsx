"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { userLearningPathService } from "@/services/userLearningPath.service";
import { learningPathService } from "@/services/learningPath.service";

interface AddLearningPathDialogProps {
  enrolledPathIds: string[];
  onSuccess: () => void;
}

export function AddLearningPathDialog({
  enrolledPathIds,
  onSuccess,
}: AddLearningPathDialogProps) {
  const [open, setOpen] = useState(false);
  const [availablePaths, setAvailablePaths] = useState<any[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingPaths, setFetchingPaths] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAvailablePaths();
    }
  }, [open]);

  const fetchAvailablePaths = async () => {
    try {
      setFetchingPaths(true);
      const response: any = await learningPathService.getAllPaths();

      if (response.code === 200 && response.data) {
        const unenrolledPaths = response.data.filter(
          (path: any) => !enrolledPathIds.includes(path._id)
        );
        setAvailablePaths(unenrolledPaths);
      }
    } catch (error) {
      console.error("Error fetching paths:", error);
      toast.error("Không thể tải danh sách lộ trình");
    } finally {
      setFetchingPaths(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPathId) {
      toast.error("Vui lòng chọn lộ trình");
      return;
    }

    try {
      setLoading(true);
      const response =
        await userLearningPathService.addLearningPath(selectedPathId);

      if (response.code === 200) {
        toast.success("Đăng ký lộ trình thành công!");
        setOpen(false);
        setSelectedPathId("");
        onSuccess();
      } else {
        toast.error(response.message || "Đăng ký lộ trình thất bại");
      }
    } catch (error: any) {
      console.error("Error adding path:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Đăng ký lộ trình mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Đăng ký lộ trình học mới</DialogTitle>
          <DialogDescription>
            Chọn lộ trình bạn muốn học từ danh sách có sẵn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="learning-path">Lộ trình học</Label>
            {fetchingPaths ? (
              <div className="text-sm text-gray-500">Đang tải...</div>
            ) : availablePaths.length === 0 ? (
              <div className="text-sm text-gray-500">
                Bạn đã đăng ký tất cả lộ trình có sẵn
              </div>
            ) : (
              <Select value={selectedPathId} onValueChange={setSelectedPathId}>
                <SelectTrigger id="learning-path">
                  <SelectValue placeholder="Chọn lộ trình" />
                </SelectTrigger>
                <SelectContent>
                  {availablePaths.map((path) => (
                    <SelectItem key={path._id} value={path._id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{path.title}</span>
                        {path.description && (
                          <span className="text-xs text-gray-500">
                            {path.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedPathId || availablePaths.length === 0}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
