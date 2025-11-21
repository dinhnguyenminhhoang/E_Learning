"use client";

import { useEffect, useMemo, useState } from "react";
import { BookMarked, Trophy, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { wordService } from "@/services/word.service";
import { toast } from "react-hot-toast";

type WordItem = {
  id: string;
  word: string;
  meaning: string;
  level: 1 | 2 | 3 | 4 | "master";
  status: "new" | "learning" | "mastered";
};

const LEVEL_TABS = ["all", "1", "2", "3", "4", "master"] as const;
type LevelTab = (typeof LEVEL_TABS)[number];

/* =======================
 * Card từ vựng
 * ======================= */
function WordCard({ item }: { item: WordItem }) {
  const chip =
    item.status === "mastered"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : item.status === "learning"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{item.word}</CardTitle>
          <Badge variant="outline" className={cn("capitalize", chip)}>
            {item.status}
          </Badge>
        </div>
        <div className="text-xs text-slate-500">
          Level {String(item.level).toUpperCase()}
        </div>
      </CardHeader>
      <CardContent className="text-sm text-slate-600">
        {item.meaning}
      </CardContent>
    </Card>
  );
}

/* =======================
 * Empty state
 * ======================= */
function EmptyState({ onLearn }: { onLearn: () => void }) {
  return (
    <div className="h-[520px] flex flex-col items-center justify-center text-center">
      <div className="mb-4 text-slate-400">
        {/* icon trừu tượng */}
        <div className="w-28 h-20 rounded-xl border-2 border-slate-300/60 flex items-center justify-center">
          <BookMarked className="w-8 h-8" />
        </div>
      </div>
      <p className="font-semibold text-slate-700 mb-1">There’s no word found</p>
      <p className="text-sm text-slate-500 mb-5">
        Start learning to add words to your list
      </p>
      <Button className="px-6" onClick={onLearn}>
        Learn now
      </Button>
    </div>
  );
}

function OverviewCard({ data }: { data: WordItem[] }) {
  const summary = useMemo(() => {
    const groups = { "Lv.1": 0, "Lv.2": 0, "Lv.3": 0, "Lv.4": 0, Master: 0 };
    data.forEach((w) => {
      if (w.level === 1) groups["Lv.1"]++;
      else if (w.level === 2) groups["Lv.2"]++;
      else if (w.level === 3) groups["Lv.3"]++;
      else if (w.level === 4) groups["Lv.4"]++;
      else groups["Master"]++;
    });
    const learnt = data.filter((w) => w.status === "mastered").length;
    return {
      learnt,
      chart: Object.entries(groups).map(([name, value]) => ({ name, value })),
    };
  }, [data]);

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <span>Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border w-full p-3 mb-4 bg-pink-50/70 flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-pink-600">
              {summary.learnt}
            </div>
            <div className="text-[13px] text-slate-600">Words learnt</div>
          </div>
          <Trophy className="w-10 h-10 text-pink-400" />
        </div>

        <div className="text-xs text-right text-slate-500 -mb-2">
          Memory level
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.chart} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyWordListPage() {
  const [active, setActive] = useState<LevelTab>("all");
  const [q, setQ] = useState("");
  const [words, setWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await wordService.getAllWords() as any;

      if (response?.code === 200 && response?.data) {
        // Transform backend Word model to WordItem format
        const transformedWords: WordItem[] = response.data.map((word: any) => ({
          id: word._id || word.id,
          word: word.word, // Backend already lowercase
          meaning: word.definitions?.[0]?.meaningVi || word.definitions?.[0]?.meaning || "", // First definition
          level: mapLevelToNumber(word.level),
          status: "new", // TODO: Need user word progress to determine actual status
        }));
        setWords(transformedWords);
      }
    } catch (error: any) {
      console.error("Error fetching words:", error);
      toast.error("Không thể tải danh sách từ vựng");
    } finally {
      setLoading(false);
    }
  };

  const mapLevelToNumber = (level: any): 1 | 2 | 3 | 4 | "master" => {
    // Backend uses: "beginner", "intermediate", "advanced"
    // Frontend needs: 1, 2, 3, 4, "master"
    if (typeof level === "string") {
      const levelMap: Record<string, 1 | 2 | 3 | 4 | "master"> = {
        beginner: 1,
        intermediate: 2,
        advanced: 3,
        master: "master",
      };
      return levelMap[level.toLowerCase()] || 1;
    }
    if (typeof level === "number") {
      if (level >= 1 && level <= 4) return level as 1 | 2 | 3 | 4;
      if (level >= 5) return "master";
    }
    return 1; // default
  };

  const filtered = useMemo(() => {
    const byLevel =
      active === "all"
        ? words
        : words.filter((w) =>
          active === "master"
            ? w.level === "master"
            : String(w.level) === active
        );
    const byQuery = q.trim()
      ? byLevel.filter(
        (w) =>
          w.word.toLowerCase().includes(q.toLowerCase()) ||
          w.meaning.toLowerCase().includes(q.toLowerCase())
      )
      : byLevel;
    return byQuery;
  }, [active, q, words]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải từ vựng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-sky-50 to-white ">
      <div className="mx-auto p-8">
        <div className="flex items-center gap-2 mb-4">
          <BookMarked className="w-5 h-5 text-slate-700" />
          <h1 className="text-2xl font-semibold text-slate-800">
            My word list
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: list */}
          <div className="lg:col-span-8">
            <Card>
              <CardHeader className="pb-3">
                <Tabs
                  value={active}
                  onValueChange={(v) => setActive(v as LevelTab)}
                >
                  <TabsList className="flex flex-wrap">
                    {LEVEL_TABS.map((lv) => (
                      <TabsTrigger key={lv} value={lv} className="capitalize">
                        {lv === "all"
                          ? "All"
                          : lv === "master"
                            ? "Master"
                            : `Level ${lv}`}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="mt-3 flex items-center gap-2">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search your words..."
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {filtered.length === 0 ? (
                  <EmptyState onLearn={() => (window.location.href = "/learn")} />
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((item) => (
                      <WordCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: overview */}
          <div className="lg:col-span-4">
            <OverviewCard data={words} />
          </div>
        </div>
      </div>
    </div>
  );
}
