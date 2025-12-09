"use client";

import { useState, useEffect } from "react";
import { Plus, BookMarked, Library, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { wordService, type UserWord, type UserWordBookmark, type Word } from "@/services/word.service";
import { toast } from "react-hot-toast";
import { AddWordModal } from "@/components/vocabulary/AddWordModal";
import { WordCard } from "@/components/vocabulary/WordCard";
import { PaginationControls } from "@/components/ui/PaginationControls";

type TabType = "my-words" | "bookmarked" | "all";

export default function MyWordListPage() {
  const [activeTab, setActiveTab] = useState<TabType>("my-words");
  const [loading, setLoading] = useState(false);

  // My Words
  const [myWords, setMyWords] = useState<UserWord[]>([]);
  const [myWordsPage, setMyWordsPage] = useState(1);
  const [myWordsPagination, setMyWordsPagination] = useState({ total: 0, totalPages: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWord, setEditingWord] = useState<UserWord | null>(null);

  // Bookmarked Words
  const [bookmarkedWords, setBookmarkedWords] = useState<UserWordBookmark[]>([]);
  const [bookmarkedPage, setBookmarkedPage] = useState(1);
  const [bookmarkedPagination, setBookmarkedPagination] = useState({ total: 0, totalPages: 0 });

  // All System Words
  const [systemWords, setSystemWords] = useState<Word[]>([]);
  const [systemPage, setSystemPage] = useState(1);
  const [systemPagination, setSystemPagination] = useState({ total: 0, totalPages: 0 });
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Stats
  const [stats, setStats] = useState({
    customWordsCount: 0,
    bookmarkedCount: 0,
    systemWordsCount: 0,
  });

  useEffect(() => {
    loadData();
  }, [activeTab, myWordsPage, bookmarkedPage, systemPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "my-words") {
        const res: any = await wordService.getMyCustomWords({ pageNum: myWordsPage, pageSize: 12 });
        if (res.code === 200) {
          setMyWords(res.data.words);
          setMyWordsPagination({
            total: res.data.pagination.total,
            totalPages: res.data.pagination.totalPages
          });
          setStats(prev => ({ ...prev, customWordsCount: res.data.pagination.total }));
        }
      } else if (activeTab === "bookmarked") {
        const res: any = await wordService.getBookmarkedWords({ pageNum: bookmarkedPage, pageSize: 12 });
        if (res.code === 200) {
          setBookmarkedWords(res.data.bookmarks);
          setBookmarkedPagination({
            total: res.data.pagination.total,
            totalPages: res.data.pagination.totalPages
          });
          setStats(prev => ({ ...prev, bookmarkedCount: res.data.pagination.total }));
        }
      } else {
        const [systemRes, bookmarkRes]: [any, any] = await Promise.all([
          wordService.getAllWords({ pageNum: systemPage, pageSize: 12 }),
          wordService.getBookmarkedWords({ pageSize: 1000 }),
        ]);

        if (systemRes.code === 200) {
          setSystemWords(systemRes.data);
          setSystemPagination({
            total: systemRes.pagination.total,
            totalPages: systemRes.pagination.totalPages
          });
          setStats(prev => ({ ...prev, systemWordsCount: systemRes.pagination.total }));
        }

        if (bookmarkRes.code === 200) {
          const ids = new Set<string>(bookmarkRes.data.bookmarks.map((b: any) => b.word._id));
          setBookmarkedIds(ids);
        }
      }
    } catch (error) {
      console.error("Error loading vocabulary:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = () => {
    setEditingWord(null);
    setShowAddModal(true);
  };

  const handleEditWord = (word: UserWord) => {
    setEditingWord(word);
    setShowAddModal(true);
  };

  const handleDeleteWord = async (wordId: string) => {
    if (!confirm("Bạn có chắc muốn xóa từ này?")) return;

    try {
      await wordService.deleteCustomWord(wordId);
      toast.success("Đã xóa từ");
      loadData();
    } catch (error) {
      toast.error("Không thể xóa từ");
    }
  };

  const handleToggleBookmark = async (wordId: string) => {
    try {
      await wordService.toggleBookmark(wordId, "manual");
      toast.success("Đã cập nhật bookmark");
      loadData();
    } catch (error) {
      toast.error("Không thể cập nhật bookmark");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Kho Từ Vựng
              </h1>
              <p className="text-gray-600 mt-2">Quản lý và học từ vựng của bạn</p>
            </div>
            {activeTab === "my-words" && (
              <Button onClick={handleAddWord} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Thêm từ mới
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-2xl p-4 border-2 border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{stats.customWordsCount}</div>
              <div className="text-sm text-gray-600">Từ của tôi</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border-2 border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600">{stats.bookmarkedCount}</div>
              <div className="text-sm text-gray-600">Đã bookmark</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border-2 border-purple-200">
              <div className="text-3xl font-bold text-purple-600">{stats.systemWordsCount}</div>
              <div className="text-sm text-gray-600">Từ hệ thống</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="my-words" className="gap-2">
              <Library className="w-4 h-4" />
              Từ của tôi
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="gap-2">
              <BookMarked className="w-4 h-4" />
              Đã bookmark
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Star className="w-4 h-4" />
              Tất cả
            </TabsTrigger>
          </TabsList>

          {/* My Words Tab */}
          <TabsContent value="my-words">
            {loading ? (
              <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>
            ) : myWords.length === 0 ? (
              <div className="text-center py-20">
                <Library className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có từ nào</h3>
                <p className="text-gray-600 mb-6">Bắt đầu thêm từ vựng của riêng bạn!</p>
                <Button onClick={handleAddWord}>Thêm từ đầu tiên</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myWords.map((word) => (
                    <WordCard
                      key={word._id}
                      word={word}
                      type="custom"
                      onEdit={() => handleEditWord(word)}
                      onDelete={() => handleDeleteWord(word._id)}
                    />
                  ))}
                </div>
                {myWordsPagination.totalPages > 1 && (
                  <div className="mt-8">
                    <PaginationControls
                      currentPage={myWordsPage}
                      totalPages={myWordsPagination.totalPages}
                      onPageChange={(page) => setMyWordsPage(page)}
                    />
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Bookmarked Tab */}
          <TabsContent value="bookmarked">
            {loading ? (
              <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>
            ) : bookmarkedWords.length === 0 ? (
              <div className="text-center py-20">
                <BookMarked className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có từ bookmark</h3>
                <p className="text-gray-600">Bookmark các từ trong hệ thống để xem sau!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarkedWords.map((bookmark) => (
                    <WordCard
                      key={bookmark._id}
                      word={bookmark.word}
                      type="bookmarked"
                      bookmark={bookmark}
                      onToggleBookmark={() => handleToggleBookmark(bookmark.word._id)}
                    />
                  ))}
                </div>
                {bookmarkedPagination.totalPages > 1 && (
                  <div className="mt-8">
                    <PaginationControls
                      currentPage={bookmarkedPage}
                      totalPages={bookmarkedPagination.totalPages}
                      onPageChange={(page) => setBookmarkedPage(page)}
                    />
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* All System Words Tab */}
          <TabsContent value="all">
            {loading ? (
              <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {systemWords.map((word) => (
                    <WordCard
                      key={word._id}
                      word={word}
                      type="system"
                      isBookmarked={bookmarkedIds.has(word._id)}
                      onToggleBookmark={() => handleToggleBookmark(word._id)}
                    />
                  ))}
                </div>
                {systemPagination.totalPages > 1 && (
                  <div className="mt-8">
                    <PaginationControls
                      currentPage={systemPage}
                      totalPages={systemPagination.totalPages}
                      onPageChange={(page) => setSystemPage(page)}
                    />
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Modal */}
      <AddWordModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingWord(null);
        }}
        onSuccess={loadData}
        editWord={editingWord}
      />
    </div>
  );
}
