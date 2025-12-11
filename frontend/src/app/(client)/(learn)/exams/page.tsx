"use client";

import { useState, useEffect } from "react";
import { examService } from "@/services/exam.service";
import { examAttemptService } from "@/services/examAttempt.service";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ExamsPage() {
    const router = useRouter();
    const [availableExams, setAvailableExams] = useState<any[]>([]);
    const [examAttempts, setExamAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [learningPathTitle, setLearningPathTitle] = useState("");

    useEffect(() => {
        fetchExamsData();
    }, []);

    const fetchExamsData = async () => {
        try {
            setLoading(true);

            // Fetch both available exams and exam attempts in parallel
            const [availableResponse, attemptsResponse] = await Promise.all([
                examService.getAvailableExams(),
                examService.getMyExamAttempts({ page: 1, limit: 10 }),
            ]);

            if (availableResponse.code === 200 && availableResponse.data) {
                setAvailableExams(availableResponse.data.exams || []);
                setLearningPathTitle(availableResponse.data.learningPath?.title || "");
            }

            if (attemptsResponse.code === 200 && attemptsResponse.data) {
                setExamAttempts(attemptsResponse.data.attempts || []);
            }
        } catch (error: any) {
            console.error("Error fetching exams data:", error);
            toast.error("Không thể tải dữ liệu exams");
        } finally {
            setLoading(false);
        }
    };

    const handleStartExam = async (examId: string) => {
        try {
            const response = await examAttemptService.startExam(examId);

            if (response.code === 200 || response.code === 201) {
                const attemptId = response.data.exam.attemptId;
                toast.success("Bắt đầu exam thành công!");
                router.push(`/exams/${examId}?attemptId=${attemptId}`);
            } else {
                toast.error((response as any).message || "Không thể bắt đầu exam");
            }
        } catch (error: any) {
            console.error("Error starting exam:", error);
            toast.error(error.response?.data?.message || "Lỗi khi bắt đầu exam");
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            available: "bg-green-100 text-green-700 border-green-200",
            locked: "bg-gray-100 text-gray-600 border-gray-200",
            completed: "bg-blue-100 text-blue-700 border-blue-200",
            in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
        };

        const labels = {
            available: "Có thể thi",
            locked: "Đã khóa",
            completed: "Hoàn thành",
            in_progress: "Đang làm",
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${badges[status as keyof typeof badges] || badges.locked}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const formatTime = (seconds: number) => {
        if (!seconds) return "N/A";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes} phút`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="mx-auto p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Bài Kiểm Tra 📝
                    </h1>
                    <p className="text-gray-600 text-lg">
                        {learningPathTitle && `Lộ trình: ${learningPathTitle}`}
                    </p>
                </div>

                {/* Available Exams Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Bài kiểm tra có sẵn
                    </h2>

                    {availableExams.length === 0 ? (
                        <div className="bg-white rounded-3xl shadow-lg p-12 text-center border border-gray-100">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Chưa có bài kiểm tra nào
                            </h3>
                            <p className="text-gray-600">
                                Hoàn thành các bài học để mở khóa bài kiểm tra
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableExams.map((item) => (
                                <div
                                    key={item.exam.id}
                                    className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl">
                                            🎯
                                        </div>
                                        {getStatusBadge(item.status)}
                                    </div>

                                    {/* Exam Title */}
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        {item.exam.title}
                                    </h3>

                                    {/* Level Info */}
                                    <div className="bg-blue-50 rounded-xl p-3 mb-4">
                                        <div className="text-sm font-semibold text-blue-800 mb-1">
                                            Level {item.level.order}: {item.level.title}
                                        </div>
                                        <div className="text-xs text-blue-600">
                                            {item.level.completedLessons}/{item.level.totalLessons} bài học hoàn thành
                                        </div>
                                    </div>

                                    {/* Exam Info */}
                                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <span>📖</span>
                                            <span>{item.exam.sectionsCount} phần thi</span>
                                        </div>
                                        {item.exam.totalTimeLimit && (
                                            <div className="flex items-center gap-2">
                                                <span>⏱️</span>
                                                <span>{formatTime(item.exam.totalTimeLimit)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span>⭐</span>
                                            <span>Điểm tối đa: {item.exam.maxScore}</span>
                                        </div>
                                    </div>

                                    {/* Last Score (if completed) */}
                                    {item.lastAttempt && item.status === "completed" && (
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                                            <div className="text-sm font-semibold text-green-800">
                                                Điểm cao nhất: {item.lastAttempt.score}/{item.exam.maxScore}
                                            </div>
                                            <div className="text-xs text-green-600">
                                                {item.lastAttempt.percentage}%
                                            </div>
                                        </div>
                                    )}

                                    {/* Locked Message */}
                                    {item.status === "locked" && item.level.incompleteLessonsCount > 0 && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                                            <div className="text-sm text-yellow-800">
                                                ⚠️ Cần hoàn thành {item.level.incompleteLessonsCount} bài học
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <div className="mt-4">
                                        {item.status === "available" && (
                                            <button
                                                onClick={() => handleStartExam(item.exam.id)}
                                                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                            >
                                                Bắt đầu thi
                                            </button>
                                        )}
                                        {item.status === "in_progress" && item.lastAttempt && (
                                            <Link
                                                href={`/exams/${item.exam.id}`}
                                                className="block w-full bg-yellow-500 text-white font-semibold py-3 px-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300"
                                            >
                                                Tiếp tục thi
                                            </Link>
                                        )}
                                        {item.status === "completed" && item.lastAttempt && (
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/exams/results/${item.lastAttempt.attemptId}`}
                                                    className="flex-1 bg-blue-500 text-white font-semibold py-3 px-4 rounded-2xl text-center hover:shadow-lg transition-all duration-300 text-sm"
                                                >
                                                    Xem kết quả
                                                </Link>
                                                <button
                                                    onClick={() => handleStartExam(item.exam.id)}
                                                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold py-3 px-4 rounded-2xl hover:shadow-lg transition-all duration-300 text-sm"
                                                >
                                                    Thi lại
                                                </button>
                                            </div>
                                        )}
                                        {item.status === "locked" && (
                                            <Link
                                                href={`/topic-list`}
                                                className="block w-full bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-2xl text-center hover:bg-gray-400 transition-all duration-300"
                                            >
                                                Hoàn thành bài học
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Exam Attempts History */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Lịch sử thi
                    </h2>

                    {examAttempts.length === 0 ? (
                        <div className="bg-white rounded-3xl shadow-lg p-12 text-center border border-gray-100">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Chưa có lịch sử thi
                            </h3>
                            <p className="text-gray-600">
                                Bắt đầu làm bài kiểm tra để xem lịch sử ở đây
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {examAttempts.map((attempt) => (
                                <div
                                    key={attempt.attemptId}
                                    className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-800">
                                                    {attempt.exam.title}
                                                </h3>
                                                {getStatusBadge(attempt.status)}
                                            </div>

                                            {attempt.levelInfo && (
                                                <div className="text-sm text-gray-600 mb-3">
                                                    <span className="font-semibold">
                                                        {attempt.levelInfo.learningPathTitle}
                                                    </span>
                                                    {" - "}
                                                    <span>
                                                        Level {attempt.levelInfo.levelOrder}: {attempt.levelInfo.levelTitle}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Ngày thi:</span>{" "}
                                                    {formatDate(attempt.completedAt || attempt.startedAt)}
                                                </div>
                                                {attempt.totalTimeSpent > 0 && (
                                                    <div>
                                                        <span className="font-medium">Thời gian:</span>{" "}
                                                        {formatTime(attempt.totalTimeSpent)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right ml-6">
                                            {attempt.status === "completed" && (
                                                <>
                                                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                                                        {attempt.totalPercentage}%
                                                    </div>
                                                    <div className="text-sm text-gray-600 mb-3">
                                                        {attempt.totalScore}/{attempt.exam.maxScore} điểm
                                                    </div>
                                                    <Link
                                                        href={`/exams/results/${attempt.attemptId}`}
                                                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-xl transition-colors"
                                                    >
                                                        Xem chi tiết
                                                    </Link>
                                                </>
                                            )}
                                            {attempt.status === "in_progress" && (
                                                <Link
                                                    href={`/exams/${attempt.attemptId}`}
                                                    className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-xl transition-colors"
                                                >
                                                    Tiếp tục
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
