"use client";

import { useEffect, useState } from "react";
import { leaderboardService, LeaderboardUser } from "@/services/leaderboard.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Trophy, Medal, ArrowUp, ArrowDown, Minus, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<"weekly" | "monthly" | "allTime">("weekly");

    useEffect(() => {
        loadLeaderboard();
    }, [period]);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const data = await leaderboardService.getLeaderboard(period);
            setUsers(data);
        } catch (error) {
            console.error("Failed to load leaderboard", error);
            toast.error("Không thể tải bảng xếp hạng");
        } finally {
            setLoading(false);
        }
    };

    const top3 = users.slice(0, 3);
    const rest = users.slice(3);
    const currentUser = users.find(u => u.isCurrentUser);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" />;
            case 2: return <Medal className="h-6 w-6 text-gray-400 fill-gray-400" />;
            case 3: return <Medal className="h-6 w-6 text-amber-700 fill-amber-700" />;
            default: return <span className="font-bold text-gray-500 w-6 text-center">{rank}</span>;
        }
    };

    const getChangeIcon = (change?: "up" | "down" | "same") => {
        switch (change) {
            case "up": return <ArrowUp className="h-4 w-4 text-green-500" />;
            case "down": return <ArrowDown className="h-4 w-4 text-red-500" />;
            default: return <Minus className="h-4 w-4 text-gray-300" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-24 relative overflow-hidden">
            {/* Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-75" />
                <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-150" />
                <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-300" />
            </div>

            {/* Header with Premium Gradient */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white pt-12 pb-20 px-4 shadow-2xl overflow-hidden">
                {/* Animated Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse" />

                {/* Sparkle Effects */}
                <Sparkles className="absolute top-8 right-12 w-6 h-6 text-yellow-300 animate-pulse" />
                <Star className="absolute top-16 left-16 w-5 h-5 text-blue-200 animate-pulse delay-150" />
                <Sparkles className="absolute bottom-12 right-1/4 w-4 h-4 text-pink-300 animate-pulse delay-300" />

                <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Trophy className="h-12 w-12 text-yellow-300 drop-shadow-lg animate-bounce" />
                        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-100 to-white">
                            Leaderboard
                        </h1>
                        <Trophy className="h-12 w-12 text-yellow-300 drop-shadow-lg animate-bounce delay-75" />
                    </div>
                    <p className="text-blue-100 text-lg font-medium">
                        🏆 Compete with others and earn your spot on top! 🌟
                    </p>

                    <div className="flex justify-center mt-6">
                        <Tabs defaultValue="weekly" className="w-full max-w-md" onValueChange={(v) => setPeriod(v as any)}>
                            <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md border border-white/20 p-1 rounded-2xl shadow-lg">
                                <TabsTrigger
                                    value="weekly"
                                    className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-lg font-semibold transition-all"
                                >
                                    Weekly
                                </TabsTrigger>
                                <TabsTrigger
                                    value="monthly"
                                    className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-lg font-semibold transition-all"
                                >
                                    Monthly
                                </TabsTrigger>
                                <TabsTrigger
                                    value="allTime"
                                    className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-lg font-semibold transition-all"
                                >
                                    All Time
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-12 space-y-8 relative z-10">
                {/* Top 3 Podium - Enhanced */}
                {!loading && top3.length > 0 && (
                    <div className="flex justify-center items-end gap-6 mb-12">
                        {/* 2nd Place */}
                        {top3[1] && (
                            <div className="flex flex-col items-center group">
                                <div className="relative transform transition-transform group-hover:scale-110 group-hover:-translate-y-2">
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full blur-xl opacity-50 animate-pulse" />
                                    <Avatar className="relative h-20 w-20 border-4 border-gray-300 shadow-2xl ring-4 ring-gray-100">
                                        <AvatarImage src={top3[1].avatarUrl} />
                                        <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 font-bold text-2xl">
                                            {top3[1].displayName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
                                        2
                                    </div>
                                    <Medal className="absolute -top-2 -right-2 h-8 w-8 text-gray-400 fill-gray-400 drop-shadow-lg" />
                                </div>
                                <div className="mt-6 text-center">
                                    <p className="font-bold text-base truncate w-24">{top3[1].displayName}</p>
                                    <p className="text-sm font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {top3[1].xp} XP
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 1st Place - Champion */}
                        {top3[0] && (
                            <div className="flex flex-col items-center -mt-8 group">
                                <div className="relative transform transition-transform group-hover:scale-110 group-hover:-translate-y-3">
                                    <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 h-10 w-10 text-yellow-500 fill-yellow-500 animate-bounce drop-shadow-2xl" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full blur-2xl opacity-60 animate-pulse" />
                                    <Avatar className="relative h-28 w-28 border-[6px] border-yellow-400 shadow-2xl ring-8 ring-yellow-100 hover:ring-yellow-200 transition-all">
                                        <AvatarImage src={top3[0].avatarUrl} />
                                        <AvatarFallback className="bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 font-bold text-4xl">
                                            {top3[0].displayName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-base font-black px-4 py-1.5 rounded-full shadow-xl border-2 border-white">
                                        1
                                    </div>
                                    <Sparkles className="absolute top-0 -left-3 h-6 w-6 text-yellow-400 animate-pulse" />
                                    <Sparkles className="absolute top-2 -right-4 h-5 w-5 text-yellow-500 animate-pulse delay-75" />
                                </div>
                                <div className="mt-7 text-center">
                                    <p className="font-black text-xl truncate w-32 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                        {top3[0].displayName}
                                    </p>
                                    <p className="text-base font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {top3[0].xp} XP
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {top3[2] && (
                            <div className="flex flex-col items-center group">
                                <div className="relative transform transition-transform group-hover:scale-110 group-hover:-translate-y-2">
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full blur-xl opacity-50 animate-pulse delay-150" />
                                    <Avatar className="relative h-20 w-20 border-4 border-amber-600 shadow-2xl ring-4 ring-amber-100">
                                        <AvatarImage src={top3[2].avatarUrl} />
                                        <AvatarFallback className="bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 font-bold text-2xl">
                                            {top3[2].displayName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
                                        3
                                    </div>
                                    <Medal className="absolute -top-2 -right-2 h-8 w-8 text-amber-700 fill-amber-700 drop-shadow-lg" />
                                </div>
                                <div className="mt-6 text-center">
                                    <p className="font-bold text-base truncate w-24">{top3[2].displayName}</p>
                                    <p className="text-sm font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {top3[2].xp} XP
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Leaderboard List - Enhanced */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-20 bg-white/60 backdrop-blur-sm rounded-2xl animate-pulse shadow-lg" />
                            ))}
                        </div>
                    ) : (
                        rest.map((user) => (
                            <Card
                                key={user.id}
                                className={cn(
                                    "border-none shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm overflow-hidden group",
                                    user.isCurrentUser
                                        ? "ring-2 ring-blue-500 bg-gradient-to-r from-blue-50 to-purple-50"
                                        : "bg-white/80 hover:bg-white"
                                )}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-white/0 group-hover:via-white/10 transition-all duration-300" />
                                <CardContent className="p-5 flex items-center gap-5 relative">
                                    <div className="flex flex-col items-center justify-center w-10">
                                        <span className={cn(
                                            "font-black text-lg",
                                            user.isCurrentUser ? "text-blue-600" : "text-gray-600"
                                        )}>
                                            {user.rank}
                                        </span>
                                        {getChangeIcon(user.change)}
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity" />
                                        <Avatar className={cn(
                                            "h-12 w-12 border-2 shadow-md transition-all",
                                            user.isCurrentUser ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 group-hover:border-blue-300"
                                        )}>
                                            <AvatarImage src={user.avatarUrl} />
                                            <AvatarFallback className={cn(
                                                "font-semibold",
                                                user.isCurrentUser
                                                    ? "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
                                                    : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700"
                                            )}>
                                                {user.displayName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className="flex-1">
                                        <p className={cn(
                                            "font-bold text-base",
                                            user.isCurrentUser && "text-blue-700"
                                        )}>
                                            {user.displayName} {user.isCurrentUser && <span className="text-blue-500 text-sm">(You)</span>}
                                        </p>
                                    </div>

                                    <div className="font-black text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {user.xp} XP
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Sticky User Bar (if not in top view) - Enhanced */}
            {currentUser && currentUser.rank > 3 && (
                <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white via-blue-50 to-purple-50 border-t-2 border-blue-200 shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md p-4 z-20">
                    <div className="max-w-6xl mx-auto flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-10">
                            <span className="font-black text-lg text-blue-600">{currentUser.rank}</span>
                            {getChangeIcon(currentUser.change)}
                        </div>

                        <Avatar className="h-12 w-12 border-2 border-blue-500 ring-2 ring-blue-200 shadow-lg">
                            <AvatarImage src={currentUser.avatarUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold">
                                {currentUser.displayName[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <p className="font-black text-gray-900">You</p>
                        </div>

                        <div className="font-black text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {currentUser.xp} XP
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
