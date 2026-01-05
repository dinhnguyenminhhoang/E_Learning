"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import writingTemplateService, { WritingTemplate } from "@/services/writingTemplate.service";
import { toast } from "react-hot-toast";
import WritingPracticeCard from "@/components/writing/WritingPracticeCard";
import { Button } from "@/components/ui/button";

export default function WritingPracticeTestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [templates, setTemplates] = useState<WritingTemplate[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                const level = searchParams.get("level");
                const type = searchParams.get("type");
                const count = searchParams.get("count") ? parseInt(searchParams.get("count")!) : 20;

                const params: { level?: string; type?: string; count?: number } = { count };
                if (level) params.level = level;
                if (type && type !== "all") params.type = type;

                const result = await writingTemplateService.getRandomTemplates(params);

                if (result.data.length === 0) {
                    setError("Không tìm thấy mẫu phù hợp với tiêu chí đã chọn.");
                } else {
                    setTemplates(result.data);
                }
            } catch (err: any) {
                console.error("Error fetching templates:", err);
                setError(err.message || "Không thể tải bài luyện tập. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [searchParams]);

    const handleNext = () => {
        if (currentIndex < templates.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleExit = () => {
        router.push("/writing-practice");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Đang chuẩn bị bài luyện tập...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Đã có lỗi xảy ra</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button onClick={handleExit} className="w-full">
                        Quay lại trang chọn
                    </Button>
                </div>
            </div>
        );
    }

    if (templates.length > 0) {
        return (
            <WritingPracticeCard
                template={templates[currentIndex]}
                currentIndex={currentIndex}
                totalTemplates={templates.length}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onExit={handleExit}
            />
        );
    }

    return null;
}
