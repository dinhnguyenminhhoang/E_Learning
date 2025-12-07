"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { quizService } from "@/services/quiz.service";

interface Quiz {
    _id: string;
    title: string;
    difficulty?: string;
    questions?: any[];
    type?: string;
}

interface QuizPickerProps {
    value: string;
    onChange: (quizId: string) => void;
    skill?: "listening" | "reading" | "writing" | "speaking";
    initialQuiz?: Quiz | null; // Pre-loaded quiz data from parent
}

export function QuizPicker({ value, onChange, skill, initialQuiz }: QuizPickerProps) {
    const [open, setOpen] = useState(false);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedQuizInfo, setSelectedQuizInfo] = useState<Quiz | null>(initialQuiz || null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Load quizzes on mount and when page changes
    useEffect(() => {
        loadQuizzes();
    }, [page]);

    // Update selectedQuizInfo when initialQuiz changes
    useEffect(() => {
        if (initialQuiz) {
            setSelectedQuizInfo(initialQuiz);
        }
    }, [initialQuiz]);

    // Load selected quiz info if value is provided and not in initialQuiz
    useEffect(() => {
        if (value && !initialQuiz && !quizzes.find(q => q._id === value)) {
            loadSelectedQuiz();
        }
    }, [value, initialQuiz]);

    useEffect(() => {
        filterQuizzes();
    }, [search, quizzes]);

    const loadSelectedQuiz = async () => {
        if (!value) return;
        try {
            const response: any = await quizService.getQuizById(value);
            if (response.data) {
                setSelectedQuizInfo(response.data);
            }
        } catch (error) {
            console.error("Error loading selected quiz:", error);
        }
    };

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const response: any = await quizService.getAllQuizzes({
                pageNum: page,
                pageSize: 50,
            });

            // Now backend returns proper structure: response.data = quiz array
            let quizList = [];
            if (response.data) {
                quizList = response.data;
            }

            setQuizzes(quizList);

            if (response.pagination) {
                setTotalPages(response.pagination.totalPages || 1);
            }
        } catch (error) {
            console.error("Error loading quizzes:", error);
            setQuizzes([]);
        } finally {
            setLoading(false);
        }
    };

    const filterQuizzes = () => {
        let filtered = quizzes;

        // Filter by search
        if (search) {
            filtered = filtered.filter((quiz) =>
                quiz.title.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredQuizzes(filtered);
    };

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty?.toLowerCase()) {
            case "beginner":
                return "bg-green-100 text-green-700";
            case "intermediate":
                return "bg-blue-100 text-blue-700";
            case "advanced":
                return "bg-purple-100 text-purple-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const selectedQuiz = quizzes.find((quiz) => quiz._id === value) || selectedQuizInfo;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    type="button"
                    className="w-full justify-between"
                >
                    {selectedQuiz ? (
                        <span className="truncate">{selectedQuiz.title}</span>
                    ) : (
                        <span className="text-gray-500">Select quiz...</span>
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Quiz</DialogTitle>
                    <DialogDescription>
                        Choose a quiz for this exam section
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search quizzes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Quiz List */}
                    <div className="flex-1 overflow-y-auto border rounded-lg">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                            </div>
                        ) : filteredQuizzes.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p>No quizzes found.</p>
                                {search && (
                                    <p className="text-sm mt-1">
                                        Try adjusting your search term
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredQuizzes.map((quiz) => (
                                    <button
                                        key={quiz._id}
                                        type="button"
                                        onClick={() => {
                                            onChange(quiz._id);
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "w-full p-4 hover:bg-gray-50 transition-colors text-left flex items-start gap-3",
                                            value === quiz._id && "bg-blue-50 hover:bg-blue-100"
                                        )}
                                    >
                                        <div className="mt-1">
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                value === quiz._id
                                                    ? "border-blue-600 bg-blue-600"
                                                    : "border-gray-300"
                                            )}>
                                                {value === quiz._id && (
                                                    <Check className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium text-gray-900 truncate">
                                                    {quiz.title}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {quiz.difficulty && (
                                                    <Badge
                                                        className={cn(
                                                            "text-xs",
                                                            getDifficultyColor(quiz.difficulty)
                                                        )}
                                                    >
                                                        {quiz.difficulty}
                                                    </Badge>
                                                )}
                                                {quiz.type && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {quiz.type}
                                                    </Badge>
                                                )}
                                                {quiz.questions && (
                                                    <span className="text-xs text-gray-500">
                                                        {quiz.questions.length} questions
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center pt-2 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1 || loading}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages || loading}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
