"use client";

import { useEffect, useState } from "react";
import { fakeLeaderboardService, LeaderboardUser } from "@/services/fakeLeaderboard.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Trophy, Medal, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

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
            const data = await fakeLeaderboardService.getLeaderboard(period);
            setUsers(data);
        } catch (error) {
            console.error("Failed to load leaderboard", error);
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
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-blue-600 text-white pt-8 pb-16 px-4 rounded-b-[2.5rem] shadow-lg">
                <div className="max-w-md mx-auto text-center space-y-4">
                    <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                        <Trophy className="h-8 w-8 text-yellow-300" />
                        Leaderboard
                    </h1>
                    <p className="text-blue-100">Compete with others and earn your spot!</p>

                    <div className="flex justify-center mt-4">
                        <Tabs defaultValue="weekly" className="w-full max-w-xs" onValueChange={(v) => setPeriod(v as any)}>
                            <TabsList className="grid w-full grid-cols-3 bg-blue-700/50 text-white border border-blue-500/30">
                                <TabsTrigger value="weekly" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">Weekly</TabsTrigger>
                                <TabsTrigger value="monthly" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">Monthly</TabsTrigger>
                                <TabsTrigger value="allTime" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">All Time</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 -mt-10 space-y-6">
                {/* Top 3 Podium */}
                {!loading && top3.length > 0 && (
                    <div className="flex justify-center items-end gap-4 mb-8">
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <Avatar className="h-16 w-16 border-4 border-gray-300 shadow-md">
                                    <AvatarImage src={top3[1].avatarUrl} />
                                    <AvatarFallback className="bg-gray-200 text-gray-700 font-bold">
                                        {top3[1].displayName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    2
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="font-semibold text-sm truncate w-20">{top3[1].displayName}</p>
                                <p className="text-xs text-blue-600 font-bold">{top3[1].xp} XP</p>
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="flex flex-col items-center -mt-8">
                            <div className="relative">
                                <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 h-8 w-8 text-yellow-500 fill-yellow-500 animate-bounce" />
                                <Avatar className="h-24 w-24 border-4 border-yellow-400 shadow-xl ring-4 ring-yellow-100">
                                    <AvatarImage src={top3[0].avatarUrl} />
                                    <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-2xl">
                                        {top3[0].displayName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-sm font-bold px-3 py-0.5 rounded-full shadow-sm">
                                    1
                                </div>
                            </div>
                            <div className="mt-5 text-center">
                                <p className="font-bold text-base truncate w-24">{top3[0].displayName}</p>
                                <p className="text-sm text-blue-600 font-extrabold">{top3[0].xp} XP</p>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <Avatar className="h-16 w-16 border-4 border-amber-600 shadow-md">
                                    <AvatarImage src={top3[2].avatarUrl} />
                                    <AvatarFallback className="bg-amber-100 text-amber-800 font-bold">
                                        {top3[2].displayName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    3
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="font-semibold text-sm truncate w-20">{top3[2].displayName}</p>
                                <p className="text-xs text-blue-600 font-bold">{top3[2].xp} XP</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 bg-white rounded-xl animate-pulse shadow-sm" />
                            ))}
                        </div>
                    ) : (
                        rest.map((user) => (
                            <Card key={user.id} className={cn(
                                "border-none shadow-sm hover:shadow-md transition-shadow",
                                user.isCurrentUser && "ring-2 ring-blue-500 bg-blue-50"
                            )}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center w-8">
                                        <span className="font-bold text-gray-500">{user.rank}</span>
                                        {getChangeIcon(user.change)}
                                    </div>

                                    <Avatar className="h-10 w-10 border border-gray-100">
                                        <AvatarImage src={user.avatarUrl} />
                                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                            {user.displayName[0]}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                        <p className={cn("font-semibold", user.isCurrentUser && "text-blue-700")}>
                                            {user.displayName} {user.isCurrentUser && "(You)"}
                                        </p>
                                    </div>

                                    <div className="font-bold text-gray-700">
                                        {user.xp} XP
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Sticky User Bar (if not in top view) */}
            {currentUser && currentUser.rank > 3 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-10">
                    <div className="max-w-md mx-auto flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-8">
                            <span className="font-bold text-blue-600">{currentUser.rank}</span>
                            {getChangeIcon(currentUser.change)}
                        </div>

                        <Avatar className="h-10 w-10 border-2 border-blue-500">
                            <AvatarImage src={currentUser.avatarUrl} />
                            <AvatarFallback className="bg-blue-600 text-white font-semibold">
                                {currentUser.displayName[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <p className="font-bold text-gray-900">You</p>
                        </div>

                        <div className="font-bold text-blue-600">
                            {currentUser.xp} XP
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
