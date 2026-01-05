"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { quizAdminService } from "@/services/quizAdmin.service";
import { Quiz, Question, MatchingPair } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Trash2, Plus, X, Check, Edit } from "lucide-react";
import { toast } from "react-hot-toast";
import { buildQuestionBody } from "@/utils/question.utils";

// Skill options matching backend enum
const SKILL_OPTIONS = [
  { value: "reading", label: "Reading" },
  { value: "listening", label: "Listening" },
  { value: "writing", label: "Writing" },
  { value: "speaking", label: "Speaking" },
  { value: "grammar", label: "Grammar" },
  { value: "vocabulary", label: "Vocabulary" },
];

// Difficulty options
const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

// Status options
const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

// Question type options
const QUESTION_TYPE_OPTIONS = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "true_false", label: "True/False" },
  { value: "fill_blank", label: "Fill in the Blank" },
  { value: "matching", label: "Matching" },
  { value: "writing", label: "Writing" },
  { value: "speaking", label: "Speaking" },
];

const normalizeDifficulty = (difficulty: string): string => {
  const map: Record<string, string> = {
    beginner: "EASY",
    intermediate: "MEDIUM",
    advanced: "HARD",
  };
  return map[difficulty?.toLowerCase()] || difficulty?.toUpperCase() || "EASY";
};

interface QuestionFormData {
  type: string;
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  correctAnswer: string;
  explanation: string;
  points: number;
  matchingPairs: MatchingPair[]; // For Matching questions
}

// ✅ 1. CẬP NHẬT PROPS: Thêm các hàm xử lý Matching
interface QuestionFormDialogProps {
  isEdit: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  formData: QuestionFormData;
  onChange: (field: keyof QuestionFormData, value: any) => void;
  onOptionChange: (
    index: number,
    field: "text" | "isCorrect",
    value: any
  ) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  // 👇 Các hàm mới cho Matching
  onMatchingChange: (
    index: number,
    field: "left" | "right",
    value: string
  ) => void;
  onAddMatchingPair: () => void;
  onRemoveMatchingPair: (index: number) => void;
}

const QuestionFormDialog = ({
  isEdit,
  onClose,
  onSubmit,
  loading,
  formData,
  onChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  // 👇 Destructuring các props mới
  onMatchingChange,
  onAddMatchingPair,
  onRemoveMatchingPair,
}: QuestionFormDialogProps) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {isEdit ? "Edit Question" : "Add New Question"}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Question Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Question Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => onChange("type", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {QUESTION_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Question Text <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.questionText}
            onChange={(e) => onChange("questionText", e.target.value)}
            placeholder="Enter your question..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Options Logic (Multiple Choice / True False) */}
        {(formData.type === "multiple_choice" ||
          formData.type === "true_false") && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Answer Options
            </label>
            <div className="space-y-2">
              {formData.options.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOptionChange(idx, "isCorrect", true)}
                    className={`p-2 rounded-full border-2 ${
                      option.isCorrect
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-green-400"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <Input
                    value={option.text}
                    onChange={(e) =>
                      onOptionChange(idx, "text", e.target.value)
                    }
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1"
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => onRemoveOption(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddOption}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </Button>
          </div>
        )}

        {/* ✅ 2. GẮN SỰ KIỆN: UI cho Matching */}
        {formData.type === "matching" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Matching Pairs <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {formData.matchingPairs?.map((pair, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder={`Left item ${idx + 1}`}
                      value={pair.left.text}
                      onChange={(e) =>
                        onMatchingChange(idx, "left", e.target.value)
                      }
                    />
                  </div>
                  <div className="text-gray-400">↔</div>
                  <div className="flex-1">
                    <Input
                      placeholder={`Right item ${idx + 1}`}
                      value={pair.right.text}
                      onChange={(e) =>
                        onMatchingChange(idx, "right", e.target.value)
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveMatchingPair(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    disabled={formData.matchingPairs!.length <= 1} // Không cho xóa nếu chỉ còn 1 cặp
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddMatchingPair}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Pair
            </Button>
          </div>
        )}

        {/* Fill Blank Correct Answer */}
        {formData.type === "fill_blank" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Correct Answer
            </label>
            <Input
              value={formData.correctAnswer}
              onChange={(e) => onChange("correctAnswer", e.target.value)}
              placeholder="Enter the correct answer"
            />
          </div>
        )}

        {/* Points & Explanation */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Points
            </label>
            <Input
              type="number"
              value={formData.points}
              onChange={(e) => onChange("points", Number(e.target.value))}
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={formData.explanation}
            onChange={(e) => onChange("explanation", e.target.value)}
            placeholder="Explain the correct answer..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
      </div>

      <div className="p-6 border-t flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              {isEdit ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>
              {isEdit ? (
                <Save className="w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isEdit ? "Update Question" : "Add Question"}
            </>
          )}
        </Button>
      </div>
    </div>
  </div>
);

// ✅ Cập nhật default state để bao gồm matchingPairs
const defaultQuestionForm: QuestionFormData = {
  type: "multiple_choice",
  questionText: "",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
  correctAnswer: "",
  explanation: "",
  points: 10,
  matchingPairs: [{ left: { text: "" }, right: { text: "" } }],
};

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    skill: "reading",
    difficulty: "EASY",
    status: "draft",
    xpReward: 50,
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] =
    useState<QuestionFormData>(defaultQuestionForm);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizAdminService.getById(quizId);
      if (response.code === 200 && response.data) {
        setQuiz(response.data);
        const normalizedDifficulty = normalizeDifficulty(
          response.data.difficulty
        );
        setFormData({
          title: response.data.title || "",
          skill: response.data.skill || "reading",
          difficulty: normalizedDifficulty,
          status: response.data.status || "draft",
          xpReward: response.data.xpReward || 50,
        });
      } else {
        toast.error("Quiz not found");
        router.push("/admin/quizzes");
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Quiz title is required");
      return;
    }
    try {
      setSaving(true);
      const response = await quizAdminService.update(quizId, formData as any);
      if (response.code === 200) {
        toast.success("Quiz updated successfully!");
        router.push("/admin/quizzes");
      }
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast.error("Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      const response = await quizAdminService.delete(quizId);
      if (response.code === 200) {
        toast.success("Quiz deleted successfully!");
        router.push("/admin/quizzes");
      }
    } catch (error) {
      toast.error("Failed to delete quiz");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "xpReward" ? Number(value) : value,
    }));
  };

  // --- Handlers cho Options ---
  const handleQuestionChange = (field: keyof QuestionFormData, value: any) => {
    setQuestionForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (
    index: number,
    field: "text" | "isCorrect",
    value: any
  ) => {
    setQuestionForm((prev) => {
      const newOptions = [...prev.options];
      if (field === "isCorrect" && value === true) {
        newOptions.forEach((opt, i) => {
          opt.isCorrect = i === index;
        });
      } else {
        newOptions[index] = { ...newOptions[index], [field]: value };
      }
      return { ...prev, options: newOptions };
    });
  };

  const addOption = () => {
    setQuestionForm((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", isCorrect: false }],
    }));
  };

  const removeOption = (index: number) => {
    if (questionForm.options.length <= 2) {
      toast.error("Minimum 2 options required");
      return;
    }
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleMatchingChange = (
    index: number,
    field: "left" | "right",
    value: string
  ) => {
    setQuestionForm((prev) => {
      const currentPairs = prev.matchingPairs || [];
      const newPairs = [...currentPairs];
      
      // Lấy giá trị cũ để giữ lại các thuộc tính khác (nếu có)
      const oldItem = newPairs[index][field] || {};

      // Cập nhật: Giữ nguyên là Object, update key "text" (hoặc key nào bạn dùng)
      newPairs[index] = { 
        ...newPairs[index], 
        [field]: { ...oldItem, text: value } 
      };
      
      return { ...prev, matchingPairs: newPairs };
    });
  };
  const addMatchingPair = () => {
    setQuestionForm((prev) => ({
      ...prev,
      matchingPairs: [...(prev.matchingPairs || []), { left: { text: "" }, right: { text: "" } }],
    }));
  };

  const removeMatchingPair = (index: number) => {
    setQuestionForm((prev) => {
      const currentPairs = prev.matchingPairs || [];
      if (currentPairs.length <= 1) {
        toast.error("Must have at least 1 pair");
        return prev;
      }
      return {
        ...prev,
        matchingPairs: currentPairs.filter((_, i) => i !== index),
      };
    });
  };

  const resetQuestionForm = () => {
    setQuestionForm(defaultQuestionForm);
    setEditingQuestion(null);
  };

  // Add Question
  const handleAddQuestion = async () => {
    if (!questionForm.questionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    // Validate Matching
    if (questionForm.type === "matching") {
      const pairs = questionForm.matchingPairs || [];
      console.log("Validating matching pairs:", pairs);
      const isEmpty = pairs.some((p) => !p.left.text.trim() || !p.right.text.trim());
      if (pairs.length === 0 || isEmpty) {
        toast.error("Please fill in all matching pairs");
        return;
      }
    }

    if (
      questionForm.type === "multiple_choice" ||
      questionForm.type === "true_false"
    ) {
      const hasCorrect = questionForm.options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        toast.error("Please select a correct answer");
        return;
      }
      const hasEmptyOption = questionForm.options.some((o) => !o.text.trim());
      if (hasEmptyOption) {
        toast.error("All options must have text");
        return;
      }
    }

    try {
      setActionLoading(true);

      const questionData = buildQuestionBody(questionForm);
      console.log("Adding Question with data:", questionData);
      const response = await quizAdminService.addQuestions(quizId, [
        questionData,
      ]);
      if (response.code === 200) {
        toast.success("Question added successfully!");
        setShowAddDialog(false);
        resetQuestionForm();
        fetchQuiz();
      } else {
        toast.error(response.message || "Failed to add question");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Failed to add question");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Dialog
  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    console.log("Editing Question:", question);
    // 1. Tạo object dữ liệu trước để log
    const formValues: QuestionFormData = {
      type: question.type,
      questionText: question.questionText || question.question || "",
      options: question.options || [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
      // Load existing pairs or default
      matchingPairs: question.matchingPair || [
        { left: { text: "" }, right: { text: "" } },
        { left: { text: "" }, right: { text: "" } },
      ],
      correctAnswer: question.correctAnswer || "",
      explanation: question.explanation || "",
      points: question.points || 10,
    };
    console.log("Pre-filling form with values:", formValues);
    // 3. Cập nhật state
    setQuestionForm(formValues);
    setShowEditDialog(true);
  };

  // Update Question
  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    if (!questionForm.questionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    // Validate Matching Update
    if (questionForm.type === "matching") {
      const pairs = questionForm.matchingPairs || [];
      const isEmpty = pairs.some((p) => !p.left.text.trim() || !p.right.text.trim());
      if (pairs.length === 0 || isEmpty) {
        toast.error("Please fill in all matching pairs");
        return;
      }
    }

    if (
      questionForm.type === "multiple_choice" ||
      questionForm.type === "true_false"
    ) {
      const hasCorrect = questionForm.options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        toast.error("Please select a correct answer");
        return;
      }
      const hasEmptyOption = questionForm.options.some((o) => !o.text.trim());
      if (hasEmptyOption) {
        toast.error("All options must have text");
        return;
      }
    }

    try {
      setActionLoading(true);
      const questionData = {
        type: questionForm.type,
        questionText: questionForm.questionText,
        options: questionForm.options,
        matchingPairs: questionForm.matchingPairs, // ✅ Gửi matching pairs update
        correctAnswer: questionForm.correctAnswer || null,
        explanation: questionForm.explanation || null,
        points: questionForm.points,
        tags: editingQuestion.tags || [],
      };

      const response = await quizAdminService.updateQuestion(
        quizId,
        editingQuestion._id,
        questionData
      );
      if (response.code === 200) {
        toast.success("Question updated successfully!");
        setShowEditDialog(false);
        resetQuestionForm();
        fetchQuiz();
      } else {
        toast.error(response.message || "Failed to update question");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      setActionLoading(true);
      const response = await quizAdminService.deleteQuestion(
        quizId,
        questionId
      );
      if (response.code === 200) {
        toast.success("Question deleted successfully!");
        fetchQuiz();
      } else {
        toast.error(response.message || "Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    } finally {
      setActionLoading(false);
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

  if (!quiz) {
    return null;
  }

  return (
    <div className="p-6 mx-auto">
      {/* ... (Phần Header và Form Quiz giữ nguyên không thay đổi) ... */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quizzes
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Quiz</h1>
            <p className="text-gray-600">
              Update quiz information and questions
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ... (Các input Quiz Title, Skill... giữ nguyên) ... */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quiz ID
            </label>
            <Input
              type="text"
              value={quiz._id}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quiz Title <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Grammar Basics Quiz"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Skill <span className="text-red-500">*</span>
              </label>
              <select
                name="skill"
                value={formData.skill}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SKILL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Difficulty <span className="text-red-500">*</span>
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                XP Reward
              </label>
              <Input
                type="number"
                name="xpReward"
                value={formData.xpReward}
                onChange={handleChange}
                placeholder="50"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                Questions ({quiz.questions?.length || 0})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </Button>
            </div>
            {quiz.questions && quiz.questions.length > 0 ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {quiz.questions.map((question, idx) => (
                  <div
                    key={question._id}
                    className="p-4 bg-gray-50 rounded-lg border hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">
                          {idx + 1}.{" "}
                          {question.questionText || question.question}
                        </p>
                        <div className="flex gap-2 text-xs flex-wrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {question.type?.replace("_", " ")}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                            {question.points} pts
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(question)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question._id)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          disabled={actionLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                No questions added yet. Click "Add Question" to create one.
              </p>
            )}
          </div>

          {/* ... (Phần AttachedTo và Metadata giữ nguyên) ... */}
          {quiz.attachedTo && (
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-3">Attached To</h3>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Type:</span>{" "}
                  {quiz.attachedTo.kind}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">ID:</span>{" "}
                  {quiz.attachedTo.item}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Created At
              </label>
              <p className="text-sm text-gray-900">
                {quiz.createdAt
                  ? new Date(quiz.createdAt).toLocaleString()
                  : "-"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Last Updated
              </label>
              <p className="text-sm text-gray-900">
                {quiz.updatedAt
                  ? new Date(quiz.updatedAt).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* ✅ 4. TRUYỀN PROPS: Xuống Dialog */}
      {showAddDialog && (
        <QuestionFormDialog
          isEdit={false}
          onClose={() => {
            setShowAddDialog(false);
            resetQuestionForm();
          }}
          onSubmit={handleAddQuestion}
          loading={actionLoading}
          formData={questionForm}
          onChange={handleQuestionChange}
          onOptionChange={handleOptionChange}
          onAddOption={addOption}
          onRemoveOption={removeOption}
          // Truyền props mới
          onMatchingChange={handleMatchingChange}
          onAddMatchingPair={addMatchingPair}
          onRemoveMatchingPair={removeMatchingPair}
        />
      )}

      {showEditDialog && (
        <QuestionFormDialog
          isEdit={true}
          onClose={() => {
            setShowEditDialog(false);
            resetQuestionForm();
          }}
          onSubmit={handleUpdateQuestion}
          loading={actionLoading}
          formData={questionForm}
          onChange={handleQuestionChange}
          onOptionChange={handleOptionChange}
          onAddOption={addOption}
          onRemoveOption={removeOption}
          // Truyền props mới
          onMatchingChange={handleMatchingChange}
          onAddMatchingPair={addMatchingPair}
          onRemoveMatchingPair={removeMatchingPair}
        />
      )}
    </div>
  );
}
