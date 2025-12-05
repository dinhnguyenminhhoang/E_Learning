"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { learningPathService } from "@/services/learningPath.service";
import { targetService } from "@/services/target.service";
import { Target } from "@/types/target";
import { GraduationCap, Target as TargetIcon, BookOpen, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

interface LearningPathCard {
    _id: string;
    title: string;
    description?: string;
    level: string;
    target: {
        _id: string;
        name: string;
    };
    levels: any[];
}

export default function BrowseLearningPathsPage() {
    const router = useRouter();
    const [paths, setPaths] = useState<LearningPathCard[]>([]);
    const [targets, setTargets] = useState<Target[]>([]);
    const [selectedTarget, setSelectedTarget] = useState<string>("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch all paths
            const pathsResponse = await learningPathService.getAllPath();
            if (pathsResponse.code === 200) {
                setPaths(pathsResponse.data);
            }

            // Fetch all targets
            const targetsResponse = await targetService.getAllTargets({});
            if (targetsResponse.code === 200) {
                setTargets(targetsResponse.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load learning paths");
        } finally {
            setLoading(false);
        }
    };

    const filteredPaths =
        selectedTarget === "all"
            ? paths
            : paths.filter(
                (path) =>
                    path.target?._id === selectedTarget ||
                    path.target === selectedTarget
            );

    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case "beginner":
                return "bg-green-100 text-green-700";
            case "intermediate":
                return "bg-yellow-100 text-yellow-700";
            case "advanced":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Learning Paths
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Choose your learning journey and master English step by step
                    </p>
                </div>

                {/* Target Filter */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <TargetIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-semibold text-gray-700">
                            Filter by Target:
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setSelectedTarget("all")}
                            className={`px-6 py-2.5 rounded-full font-medium transition-all ${selectedTarget === "all"
                                    ? "bg-blue-600 text-white shadow-lg scale-105"
                                    : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400"
                                }`}
                        >
                            All Paths
                        </button>
                        {targets.map((target) => (
                            <button
                                key={target._id}
                                onClick={() => setSelectedTarget(target._id)}
                                className={`px-6 py-2.5 rounded-full font-medium transition-all ${selectedTarget === target._id
                                        ? "bg-blue-600 text-white shadow-lg scale-105"
                                        : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400"
                                    }`}
                            >
                                {target.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Learning Paths Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                ) : filteredPaths.length === 0 ? (
                    <div className="text-center py-16">
                        <GraduationCap className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            No learning paths available
                        </h3>
                        <p className="text-gray-500">
                            {selectedTarget === "all"
                                ? "Check back later for new content"
                                : "Try selecting a different target"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPaths.map((path) => (
                            <div
                                key={path._id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-200 hover:border-blue-400"
                                onClick={() =>
                                    router.push(`/learning/paths/${path._id}`)
                                }
                            >
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
                                    <div className="flex items-start justify-between mb-3">
                                        <BookOpen className="w-8 h-8" />
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(
                                                path.level
                                            )}`}
                                        >
                                            {path.level}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">
                                        {path.title}
                                    </h3>
                                    {path.target?.name && (
                                        <div className="inline-flex items-center gap-1 text-sm bg-white/20 px-3 py-1 rounded-full">
                                            <TargetIcon className="w-3 h-3" />
                                            <span>{path.target.name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className="p-6">
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {path.description || "No description available"}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4" />
                                            <span>{path.levels?.length || 0} Levels</span>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:scale-105 transform duration-200">
                                        <span>View Details</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
