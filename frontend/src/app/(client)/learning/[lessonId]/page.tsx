"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { learningPathService } from "@/services/learningPath.service";
import { blockService, QuizAttempt, QuizAnswer } from "@/services/block.service";
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
import { QuizModal } from "./components/QuizModal";
import { QuizResults } from "./components/QuizResults";

interface BlockWithLock extends Block {
    isLocked?: boolean;
    isCompleted?: boolean;
    isLearned?: boolean;
    progressPercentage?: number;
}

export default function LearningPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const lessonId = params.lessonId as string;
    const pathId = searchParams.get("pathId");

    const [blocks, setBlocks] = useState<BlockWithLock[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
    const [lessonTitle, setLessonTitle] = useState("Lesson Detail");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [totalBlocks, setTotalBlocks] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);

    const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);

    const videoRef = useRef<HTMLIFrameElement>(null);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [videoProgress, setVideoProgress] = useState({ maxWatchedTime: 0, videoDuration: 0 });

    useEffect(() => {
        if (lessonId) {
            fetchBlocks();
        }
    }, [lessonId]);

    useEffect(() => {
        if (activeBlockId && activeBlock) {
            handleBlockStart();
        }

        return () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
        };
    }, [activeBlockId]);

    const fetchBlocks = async () => {
        try {
            setLoading(true);
            const response = await learningPathService.getLearningPathHierarchy({
                learningPathId: pathId,
                isBlock: true,
                lessonId: lessonId,
            }) as any;

            if (response.code === 200 && response.data) {
                const blocksData = response.data.blocks || [];

                const blocksWithLock = blocksData.map((block: any, index: number) => {
                    const previousBlock = index > 0 ? blocksData[index - 1] : null;
                    const isLocked = index > 0 && previousBlock && !previousBlock.isCompleted;

                    return {
                        ...block,
                        isLocked: isLocked
                    };
                });

                setBlocks(blocksWithLock);
                setTotalBlocks(response.data.totalBlocks || blocksWithLock.length);
                setCompletedCount(response.data.completedBlocks || 0);

                if (blocksWithLock.length > 0) {
                    setActiveBlockId(blocksWithLock[0]._id);
                }
            }
        } catch (error) {
            console.error("Error fetching blocks:", error);
            toast.error("Failed to load lesson content");
        } finally {
            setLoading(false);
        }
    };

    const handleBlockStart = async () => {
        if (!activeBlockId || !pathId) return;

        try {
            await blockService.startBlock(activeBlockId, pathId);

            if (activeBlock?.type === "video" || activeBlock?.type === "media") {
                startVideoHeartbeat();
            }
        } catch (error) {
            console.error("Error starting block:", error);
        }
    };

    const startVideoHeartbeat = () => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }

        heartbeatIntervalRef.current = setInterval(async () => {
            if (!activeBlockId) return;

            try {
                const response = await blockService.sendVideoHeartbeat(
                    activeBlockId,
                    videoProgress.maxWatchedTime,
                    videoProgress.videoDuration
                );

                if (response.code === 200 && response.message?.data) {
                    const { isCompleted, isLearned, progressPercentage } = response.message.data;

                    updateBlockProgress(activeBlockId, {
                        isCompleted,
                        isLearned,
                        progressPercentage
                    });

                    if (isLearned && !isCompleted) {
                        toast.success("Video completed! Ready for quiz.");
                    }
                }
            } catch (error) {
                console.error("Error sending heartbeat:", error);
            }
        }, 5000);
    };

    const updateBlockProgress = (blockId: string, updates: Partial<BlockWithLock>) => {
        setBlocks(prev => prev.map(block =>
            block._id === blockId ? { ...block, ...updates } : block
        ));
    };

    const handleStartQuiz = async () => {
        if (!activeBlockId) return;

        try {
            const response = await blockService.startQuiz(activeBlockId);

            if (response.code === 200 && response.data) {
                setQuizAttempt(response.data.attempt);
                setShowQuizModal(true);
            }
        } catch (error) {
            console.error("Error starting quiz:", error);
            toast.error("Failed to start quiz");
        }
    };

    const handleSubmitQuiz = async (answers: QuizAnswer[]) => {
        if (!quizAttempt) return;

        try {
            const response = await blockService.submitQuiz(quizAttempt._id, answers);

            if (response.code === 200 && response.data) {
                setQuizResult(response.data.attempt);
                setShowQuizModal(false);
                setShowResultsModal(true);

                if (response.data.isBlockCompleted) {
                    toast.success("Block completed!");
                    await fetchBlocks();
                }
            }
        } catch (error) {
            console.error("Error submitting quiz:", error);
            toast.error("Failed to submit quiz");
        }
    };

    const handleRetryQuiz = () => {
        setShowResultsModal(false);
        setQuizResult(null);
        handleStartQuiz();
    };

    const handleContinue = () => {
        setShowResultsModal(false);
        setQuizResult(null);
        handleNext();
    };

    const activeBlock = blocks.find(b => b._id === activeBlockId);
    const activeBlockIndex = blocks.findIndex(b => b._id === activeBlockId);
    const progress = totalBlocks > 0 ? Math.round((completedCount / totalBlocks) * 100) : 0;

    const getIcon = (type: string) => {
        switch (type) {
            case "media":
            case "video":
                return <PlayCircle className="w-4 h-4" />;
            case "quiz": return <HelpCircle className="w-4 h-4" />;
            case "grammar": return <BookOpen className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const handleNext = () => {
        if (activeBlockIndex < blocks.length - 1) {
            const nextBlock = blocks[activeBlockIndex + 1];
            if (!nextBlock.isLocked) {
                setActiveBlockId(nextBlock._id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast.error("Complete the current lesson to unlock the next one");
            }
        }
    };

    const handlePrevious = () => {
        if (activeBlockIndex > 0) {
            setActiveBlockId(blocks[activeBlockIndex - 1]._id);
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    };

    const showStartQuizButton = activeBlock && (
        ((activeBlock.type === "video" || activeBlock.type === "media") && activeBlock.isLearned && !activeBlock.isCompleted) ||
        (activeBlock.type === "quiz")
    );

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
                    <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">{progress}%</span>
                    </div>

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
                <div className="flex-1 bg-white relative flex flex-col overflow-y-auto">
                    {activeBlock ? (
                        activeBlock.type === "video" || activeBlock.type === "media" ? (
                            <div className="w-full flex flex-col">
                                <div className="w-full bg-black relative">
                                    <div className="max-w-7xl mx-auto">
                                        <div className="aspect-video bg-black">
                                            <iframe
                                                ref={videoRef}
                                                src={activeBlock.videoUrl || "https://www.youtube.com/embed/GnecCts0msU"}
                                                className="w-full h-full"
                                                allowFullScreen
                                                title={activeBlock.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                onLoad={() => {
                                                    setVideoProgress({ maxWatchedTime: 0, videoDuration: 300 });
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 bg-gradient-to-b from-white to-gray-50 p-4 md:p-8">
                                    <div className="max-w-4xl mx-auto space-y-6">
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
                                                {activeBlock.title}
                                            </h2>
                                            <p className="text-gray-600 text-base leading-relaxed">
                                                {activeBlock.description}
                                            </p>
                                        </div>

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

                                            {showStartQuizButton && (
                                                <Button
                                                    onClick={handleStartQuiz}
                                                    className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700"
                                                >
                                                    Start Quiz
                                                </Button>
                                            )}

                                            <Button
                                                onClick={handleNext}
                                                disabled={activeBlockIndex === blocks.length - 1 || blocks[activeBlockIndex + 1]?.isLocked}
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

                                    {showStartQuizButton && (
                                        <Button
                                            onClick={handleStartQuiz}
                                            className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700"
                                        >
                                            Start Quiz
                                        </Button>
                                    )}

                                    <Button
                                        onClick={handleNext}
                                        disabled={activeBlockIndex === blocks.length - 1 || blocks[activeBlockIndex + 1]?.isLocked}
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

                                    {showStartQuizButton && (
                                        <Button
                                            onClick={handleStartQuiz}
                                            className="bg-purple-600 hover:bg-purple-700"
                                        >
                                            Start Quiz
                                        </Button>
                                    )}
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

                <div className={cn(
                    "w-full md:w-96 bg-white border-l border-gray-200 flex flex-col shrink-0 shadow-xl transition-transform duration-300 absolute md:relative h-full z-20",
                    sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
                )}>
                    <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Course Content</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {completedCount} of {totalBlocks} completed
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
                                    const isCompleted = block.isCompleted || false;
                                    const isLocked = block.isLocked || false;

                                    return (
                                        <button
                                            key={block._id}
                                            onClick={() => {
                                                if (!isLocked) {
                                                    setActiveBlockId(block._id);
                                                    setSidebarOpen(false);
                                                } else {
                                                    toast.error("Complete the previous lesson first");
                                                }
                                            }}
                                            disabled={isLocked}
                                            className={cn(
                                                "flex items-start gap-3 p-4 text-left transition-all rounded-xl mb-2 group",
                                                isLocked
                                                    ? "opacity-50 cursor-not-allowed border-2 border-gray-200"
                                                    : isActive
                                                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-md"
                                                        : "hover:bg-gray-50 border-2 border-transparent hover:border-gray-200"
                                            )}
                                        >
                                            <div className="mt-0.5 flex-shrink-0">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                    isLocked
                                                        ? "border-gray-300 bg-gray-100"
                                                        : isCompleted
                                                            ? "bg-green-500 border-green-500"
                                                            : isActive
                                                                ? "border-blue-500 bg-blue-100"
                                                                : "border-gray-300 bg-white group-hover:border-blue-400"
                                                )}>
                                                    {isLocked ? (
                                                        <Lock className="w-3 h-3 text-gray-500" />
                                                    ) : isCompleted ? (
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
                                                    isLocked ? "text-gray-500" : isActive ? "text-blue-700" : "text-gray-800"
                                                )}>
                                                    {block.title || "Untitled"}
                                                    {isLocked && (
                                                        <span className="ml-2 text-xs font-normal text-gray-400">
                                                            (Locked)
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <div className={cn(
                                                        "p-1 rounded",
                                                        isActive ? "bg-blue-100" : "bg-gray-100"
                                                    )}>
                                                        {getIcon(block.type)}
                                                    </div>
                                                    <span className="capitalize font-medium">{block.type}</span>
                                                    {isCompleted && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-green-600 font-semibold">✓ Done</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {isActive && !isLocked && (
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

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-10 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <QuizModal
                open={showQuizModal}
                onClose={() => setShowQuizModal(false)}
                attempt={quizAttempt}
                questions={quizAttempt?.quiz.questions || []}
                onSubmit={handleSubmitQuiz}
            />

            <QuizResults
                open={showResultsModal}
                onClose={() => setShowResultsModal(false)}
                attempt={quizResult}
                onRetry={handleRetryQuiz}
                onContinue={handleContinue}
            />
        </div>
    );
}