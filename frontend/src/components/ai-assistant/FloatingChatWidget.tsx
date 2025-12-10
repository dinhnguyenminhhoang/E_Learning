"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Minus, Plus, Send, Trash2, BookOpen, PenTool, History, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { aiAssistantService, ChatMessage, Conversation } from "@/services/aiAssistant.service";
import { cn } from "@/lib/utils";

interface FloatingChatWidgetProps {
    className?: string;
}

export function FloatingChatWidget({ className }: FloatingChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [activeMode, setActiveMode] = useState<"chat" | "grammar" | "vocabulary">("chat");
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load conversations on mount
    useEffect(() => {
        if (isOpen) {
            loadConversations();
        }
    }, [isOpen]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const loadConversations = async () => {
        try {
            const convs = await aiAssistantService.getConversations();
            setConversations(convs);
        } catch (error) {
            console.error("Failed to load conversations:", error);
        }
    };

    const loadConversation = async (convId: string) => {
        try {
            const conv = await aiAssistantService.getConversation(convId);
            setConversationId(convId);
            setMessages(conv.messages?.filter(m => m.role !== "system") || []);
            setShowHistory(false);
        } catch (error) {
            console.error("Failed to load conversation:", error);
            setMessages([{
                role: "assistant",
                content: "Không thể tải cuộc trò chuyện này. Có thể nó đã bị xóa hoặc bạn không có quyền truy cập."
            }]);
            setShowHistory(false);
        }
    };

    const startNewConversation = () => {
        setConversationId(null);
        setMessages([]);
        setShowHistory(false);
    };

    const deleteConversation = async (convId: string) => {
        try {
            await aiAssistantService.deleteConversation(convId);
            setConversations(prev => prev.filter(c => c._id !== convId));
            if (conversationId === convId) {
                startNewConversation();
            }
        } catch (error) {
            console.error("Failed to delete conversation:", error);
        }
    };

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue("");
        setIsLoading(true);

        // Add user message immediately
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);

        try {
            if (activeMode === "grammar") {
                const grammarResponse = await aiAssistantService.correctGrammar(userMessage);
                setMessages(prev => [...prev, { role: "assistant", content: grammarResponse.content }]);
            } else if (activeMode === "vocabulary") {
                const vocabResponse = await aiAssistantService.explainVocabulary(userMessage);
                setMessages(prev => [...prev, { role: "assistant", content: vocabResponse.content }]);
            } else {
                const chatResponse = await aiAssistantService.chat(userMessage, conversationId || undefined);

                // If this was a new conversation, reload the list
                if (!conversationId && chatResponse.conversationId) {
                    loadConversations();
                }

                setConversationId(chatResponse.conversationId);
                setMessages(prev => [...prev, { role: "assistant", content: chatResponse.message.content }]);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const getModeIcon = () => {
        switch (activeMode) {
            case "grammar": return <PenTool className="h-4 w-4" />;
            case "vocabulary": return <BookOpen className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getModeLabel = () => {
        switch (activeMode) {
            case "grammar": return "Sửa ngữ pháp";
            case "vocabulary": return "Tra từ vựng";
            default: return "Chat";
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full",
                    "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg",
                    "hover:from-purple-700 hover:to-indigo-700 transition-all duration-300",
                    "hover:scale-105 hover:shadow-xl",
                    className
                )}
            >
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">Trợ lý tiếng Anh</span>
            </button>
        );
    }

    if (isMinimized) {
        return (
            <div
                className={cn(
                    "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full",
                    "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg cursor-pointer",
                    className
                )}
                onClick={() => setIsMinimized(false)}
            >
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">Trợ lý tiếng Anh</span>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 hover:bg-white/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "fixed z-50 flex flex-col transition-all duration-300 ease-in-out",
                "bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700",
                "overflow-hidden",
                isExpanded
                    ? "inset-4 w-auto h-auto rounded-xl"
                    : "bottom-6 right-6 w-96 h-[500px]",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                        {getModeIcon()}
                    </div>
                    <div>
                        <span className="font-semibold">Trợ lý học tiếng Anh</span>
                        <span className="text-xs text-white/80 block">{getModeLabel()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:bg-white/20"
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? "Thu nhỏ" : "Phóng to"}
                    >
                        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:bg-white/20"
                        onClick={() => setIsMinimized(true)}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:bg-white/20"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                    onClick={() => setActiveMode("chat")}
                    className={cn(
                        "flex-1 py-2 text-xs font-medium transition-colors",
                        activeMode === "chat"
                            ? "text-purple-600 border-b-2 border-purple-600 bg-white dark:bg-gray-900"
                            : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    💬 Chat
                </button>
                <button
                    onClick={() => setActiveMode("grammar")}
                    className={cn(
                        "flex-1 py-2 text-xs font-medium transition-colors",
                        activeMode === "grammar"
                            ? "text-purple-600 border-b-2 border-purple-600 bg-white dark:bg-gray-900"
                            : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    ✏️ Ngữ pháp
                </button>
                <button
                    onClick={() => setActiveMode("vocabulary")}
                    className={cn(
                        "flex-1 py-2 text-xs font-medium transition-colors",
                        activeMode === "vocabulary"
                            ? "text-purple-600 border-b-2 border-purple-600 bg-white dark:bg-gray-900"
                            : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    📚 Từ vựng
                </button>
            </div>

            {/* Messages Area */}
            {showHistory ? (
                <div className="flex-1 overflow-y-auto min-h-0 p-4">
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start gap-2"
                            onClick={startNewConversation}
                        >
                            <Plus className="h-4 w-4" />
                            Cuộc trò chuyện mới
                        </Button>
                        {conversations.map((conv) => (
                            <div
                                key={conv._id}
                                className={cn(
                                    "flex items-center justify-between p-2 rounded-lg cursor-pointer",
                                    "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                                    conversationId === conv._id && "bg-purple-50 dark:bg-purple-900/20"
                                )}
                                onClick={() => loadConversation(conv._id)}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{conv.title}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(conv.updatedAt).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-gray-400 hover:text-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteConversation(conv._id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto min-h-0 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center py-6 text-gray-500">
                                <div className="text-4xl mb-3">🤖</div>
                                <p className="font-medium">Xin chào! Tôi là GuruLango</p>
                                {activeMode === "grammar" && (
                                    <div className="mt-3 text-left bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                                        <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">📝 Nhập câu tiếng Anh cần kiểm tra:</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">Ví dụ: "She go to school yesterday"</p>
                                    </div>
                                )}
                                {activeMode === "vocabulary" && (
                                    <div className="mt-3 text-left bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">📚 Nhập từ tiếng Anh cần tra:</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">Ví dụ: "world", "beautiful", "run"</p>
                                    </div>
                                )}
                                {activeMode === "chat" && (
                                    <p className="text-sm mt-2">Hãy hỏi tôi bất cứ điều gì về tiếng Anh!</p>
                                )}
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex gap-2",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                {msg.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white text-sm flex-shrink-0">
                                        🤖
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        "max-w-[80%] px-4 py-2 rounded-2xl text-sm",
                                        msg.role === "user"
                                            ? "bg-purple-600 text-white rounded-br-md"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md"
                                    )}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                {msg.role === "user" && (
                                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm flex-shrink-0">
                                        👤
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2 justify-start">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white text-sm">
                                    🤖
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-md">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7"
                        onClick={() => {
                            if (!showHistory) {
                                loadConversations();
                            }
                            setShowHistory(!showHistory);
                        }}
                    >
                        <History className="h-3 w-3 mr-1" />
                        {showHistory ? "Ẩn lịch sử" : "Lịch sử"}
                    </Button>
                    {activeMode === "chat" && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7"
                            onClick={startNewConversation}
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Mới
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    {activeMode === "grammar" && (
                        <span className="absolute left-6 top-[52px] text-xs text-purple-600 font-medium pointer-events-none">Câu:</span>
                    )}
                    {activeMode === "vocabulary" && (
                        <span className="absolute left-6 top-[52px] text-xs text-blue-600 font-medium pointer-events-none">Từ:</span>
                    )}
                    <Textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            activeMode === "grammar"
                                ? "She go to school yesterday..."
                                : activeMode === "vocabulary"
                                    ? "world, beautiful, amazing..."
                                    : "Hỏi về ngữ pháp, từ vựng, dịch..."
                        }
                        className={cn(
                            "flex-1 min-h-[40px] max-h-[100px] resize-none text-sm",
                            activeMode === "grammar" && "pl-10",
                            activeMode === "vocabulary" && "pl-8"
                        )}
                        rows={1}
                    />
                    <Button
                        size="icon"
                        onClick={sendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="h-10 w-10 bg-purple-600 hover:bg-purple-700"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
