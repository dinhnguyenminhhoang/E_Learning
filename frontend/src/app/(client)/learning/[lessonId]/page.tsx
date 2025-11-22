"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { learningPathService } from "@/services/learningPath.service";
import { Block } from "@/types/learning";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ChevronLeft,
    PlayCircle,
    FileText,
    HelpCircle,
    CheckCircle,
    Lock,
    Menu,
    X,
    BookOpen,
    Lightbulb,
    Award,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

export default function LearningPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const lessonId = params.lessonId as string;
    const pathId = searchParams.get("pathId");

    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
    const [lessonTitle, setLessonTitle] = useState("Lesson Detail");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (lessonId) {
            fetchBlocks();
        }
    }, [lessonId]);

    const fetchBlocks = async () => {
        try {
            setLoading(true);
            const response = await learningPathService.getLearningPathHierarchy({
                learningPathId: pathId,
                isBlock: true,
                lessonId: lessonId,
            }) as any;

            if (response.code === 200 && response.data) {
                setBlocks(response.data);
                if (response.data.length > 0) {
                    setActiveBlockId(response.data[0]._id);
                }
            }
        } catch (error) {
            console.error("Error fetching blocks:", error);
            toast.error("Failed to load lesson content");
        } finally {
            setLoading(false);
        }
    };

    const activeBlock = blocks.find(b => b._id === activeBlockId);
    const activeBlockIndex = blocks.findIndex(b => b._id === activeBlockId);
    const progress = blocks.length > 0 ? Math.round((completedBlocks.size / blocks.length) * 100) : 0;

    const getIcon = (type: string) => {
        switch (type) {
            case "media": return <PlayCircle className="w-4 h-4" />;
            case "quiz": return <HelpCircle className="w-4 h-4" />;
            case "grammar": return <BookOpen className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const handleMarkComplete = () => {
        if (activeBlockId) {
            setCompletedBlocks(prev => new Set(prev).add(activeBlockId));
            toast.success("Marked as complete!");
        }
    };

    const handleNext = () => {
        if (activeBlockIndex < blocks.length - 1) {
            setActiveBlockId(blocks[activeBlockIndex + 1]._id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevious = () => {
        if (activeBlockIndex > 0) {
            setActiveBlockId(blocks[activeBlockIndex - 1]._id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Enhanced Header */}
            <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 md:px-6 justify-between shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="hidden md:block w-px h-6 bg-gray-300" />
                    <div>
                        <h1 className="font-bold text-base md:text-lg text-gray-900">{lessonTitle}</h1>
                        <p className="text-xs text-gray-500 hidden md:block">
                            {blocks.length > 0 && `${activeBlockIndex + 1} of ${blocks.length} lessons`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Progress Badge */}
                    <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">{progress}%</span>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-gray-600 hover:text-gray-900"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Main Content Area */}
                <div className="flex-1 bg-white relative flex flex-col overflow-y-auto">
                    {activeBlock ? (
                        activeBlock.type === "media" ? (
                            <div className="w-full flex flex-col">
                                {/* Video Container with Modern Styling */}
                                <div className="w-full bg-black relative">
                                    <div className="max-w-7xl mx-auto">
                                        <div className="aspect-video bg-black">
                                            {activeBlock.sourceUrl && activeBlock.sourceType === 'youtube' ? (
                                                <iframe
                                                    src={activeBlock.sourceUrl}
                                                    className="w-full h-full"
                                                    allowFullScreen
                                                    title={activeBlock.title}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                                                    <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
                                                        <PlayCircle className="w-10 h-10" />
                                                    </div>
                                                    <p className="text-lg">Video source not available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 bg-gradient-to-b from-white to-gray-50 p-4 md:p-8">
                                    <div className="max-w-4xl mx-auto space-y-6">
                                        {/* Title & Description */}
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
                                                {activeBlock.title}
                                            </h2>
                                            <p className="text-gray-600 text-base leading-relaxed">
                                                {activeBlock.description}
                                            </p>
                                        </div>

                                        {/* AI Insights Card */}
                                        <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                                                    <Lightbulb className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">AI Lesson Insights</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Key Vocabulary */}
                                                <div className="bg-white/80 backdrop-blur rounded-xl p-5 border border-purple-100 shadow-sm">
                                                    <h4 className="text-xs font-bold text-purple-600 mb-3 uppercase tracking-wider flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                        Key Vocabulary
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {["Irregular", "Plural", "Noun", "Child/Children", "Person/People", "Mouse/Mice"].map(word => (
                                                            <span
                                                                key={word}
                                                                className="px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 rounded-lg text-xs font-semibold border border-purple-200 transition-all cursor-pointer hover:shadow-md"
                                                            >
                                                                {word}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Summary */}
                                                <div className="bg-white/80 backdrop-blur rounded-xl p-5 border border-blue-100 shadow-sm">
                                                    <h4 className="text-xs font-bold text-blue-600 mb-3 uppercase tracking-wider flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                        Summary
                                                    </h4>
                                                    <p className="text-gray-700 text-sm leading-relaxed">
                                                        This lesson covers <strong className="text-blue-700">irregular plural nouns</strong>.
                                                        Unlike regular nouns where you add 's' or 'es', these change form completely.
                                                    </p>
                                                    <ul className="mt-3 space-y-1 text-sm text-gray-600">
                                                        <li className="flex items-center gap-2">
                                                            <ChevronRight className="w-3 h-3 text-blue-500" />
                                                            Man → Men
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <ChevronRight className="w-3 h-3 text-blue-500" />
                                                            Woman → Women
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <ChevronRight className="w-3 h-3 text-blue-500" />
                                                            Child → Children
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Navigation Buttons */}
                                        <div className="flex items-center justify-between gap-4 pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={handlePrevious}
                                                disabled={activeBlockIndex === 0}
                                                className="flex-1 md:flex-none"
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-2" />
                                                Previous
                                            </Button>

                                            <Button
                                                onClick={handleMarkComplete}
                                                disabled={completedBlocks.has(activeBlockId || '')}
                                                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                                            >
                                                {completedBlocks.has(activeBlockId || '') ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Completed
                                                    </>
                                                ) : (
                                                    'Mark Complete'
                                                )}
                                            </Button>

                                            <Button
                                                onClick={handleNext}
                                                disabled={activeBlockIndex === blocks.length - 1}
                                                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700"
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : activeBlock.type === "grammar" ? (
                            <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
                                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 mb-6">
                                    <h2 className="text-3xl font-bold mb-4 text-gray-900">{activeBlock.title}</h2>
                                    <p className="text-gray-600 text-lg leading-relaxed">{activeBlock.description}</p>
                                </div>

                                <div className="space-y-6">
                                    {activeBlock.explanation && (
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-blue-200 shadow-sm">
                                            <h3 className="text-xl font-bold mb-4 text-blue-900 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-white" />
                                                </div>
                                                Explanation
                                            </h3>
                                            <div className="bg-white/80 backdrop-blur rounded-xl p-6 border border-blue-100">
                                                <p className="whitespace-pre-wrap leading-relaxed text-gray-700 text-base">
                                                    {activeBlock.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {activeBlock.examples && activeBlock.examples.length > 0 && (
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 border border-green-200 shadow-sm">
                                            <h3 className="text-xl font-bold mb-4 text-green-900 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                                                    <CheckCircle className="w-5 h-5 text-white" />
                                                </div>
                                                Examples
                                            </h3>
                                            <ul className="space-y-3">
                                                {activeBlock.examples.map((ex, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex gap-4 bg-white/80 backdrop-blur p-5 rounded-xl border border-green-100 hover:shadow-md transition-shadow"
                                                    >
                                                        <span className="text-green-600 font-bold text-xl flex-shrink-0">
                                                            {idx + 1}.
                                                        </span>
                                                        <span className="text-gray-700 text-base leading-relaxed">{ex}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between gap-4 mt-8">
                                    <Button
                                        variant="outline"
                                        onClick={handlePrevious}
                                        disabled={activeBlockIndex === 0}
                                        className="flex-1 md:flex-none"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Previous
                                    </Button>

                                    <Button
                                        onClick={handleMarkComplete}
                                        disabled={completedBlocks.has(activeBlockId || '')}
                                        className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                                    >
                                        {completedBlocks.has(activeBlockId || '') ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Completed
                                            </>
                                        ) : (
                                            'Mark Complete'
                                        )}
                                    </Button>

                                    <Button
                                        onClick={handleNext}
                                        disabled={activeBlockIndex === blocks.length - 1}
                                        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full p-8">
                                <div className="text-center max-w-md">
                                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <HelpCircle className="w-12 h-12 text-orange-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-3 text-gray-900">{activeBlock.title}</h2>
                                    <p className="text-gray-600 mb-6 text-base">{activeBlock.description}</p>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-3 inline-block">
                                        <p className="text-yellow-700 font-semibold text-sm">
                                            Content type '{activeBlock.type}' coming soon
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <PlayCircle className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-lg text-gray-600">Select a lesson to start learning</p>
                        </div>
                    )}
                </div>

                {/* Enhanced Sidebar */}
                <div className={cn(
                    "w-full md:w-96 bg-white border-l border-gray-200 flex flex-col shrink-0 shadow-xl transition-transform duration-300 absolute md:relative h-full z-20",
                    sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
                )}>
                    <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Course Content</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {completedBlocks.size} of {blocks.length} completed
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden text-gray-600"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="flex flex-col p-2">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                                    <p className="text-sm">Loading content...</p>
                                </div>
                            ) : blocks.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p className="text-sm">No content available</p>
                                </div>
                            ) : (
                                blocks.map((block, index) => {
                                    const isActive = block._id === activeBlockId;
                                    const isCompleted = completedBlocks.has(block._id);

                                    return (
                                        <button
                                            key={block._id}
                                            onClick={() => {
                                                setActiveBlockId(block._id);
                                                setSidebarOpen(false);
                                            }}
                                            className={cn(
                                                "flex items-start gap-3 p-4 text-left transition-all rounded-xl mb-2 group",
                                                isActive
                                                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-md"
                                                    : "hover:bg-gray-50 border-2 border-transparent hover:border-gray-200"
                                            )}
                                        >
                                            <div className="mt-0.5 flex-shrink-0">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                    isCompleted
                                                        ? "bg-green-500 border-green-500"
                                                        : isActive
                                                            ? "border-blue-500 bg-blue-100"
                                                            : "border-gray-300 bg-white group-hover:border-blue-400"
                                                )}>
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-4 h-4 text-white" />
                                                    ) : (
                                                        <span className={cn(
                                                            "text-xs font-bold",
                                                            isActive ? "text-blue-600" : "text-gray-400"
                                                        )}>
                                                            {index + 1}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-semibold mb-1.5 line-clamp-2",
                                                    isActive ? "text-blue-700" : "text-gray-800"
                                                )}>
                                                    {block.title || "Untitled"}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <div className={cn(
                                                        "p-1 rounded",
                                                        isActive ? "bg-blue-100" : "bg-gray-100"
                                                    )}>
                                                        {getIcon(block.type)}
                                                    </div>
                                                    <span className="capitalize font-medium">{block.type}</span>
                                                    <span>•</span>
                                                    <span>5 min</span>
                                                </div>
                                            </div>

                                            {isActive && (
                                                <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-10 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}