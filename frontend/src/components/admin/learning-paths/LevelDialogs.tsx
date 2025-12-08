"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LevelDialogsProps {
    // Create Level Dialog
    showCreateDialog: boolean;
    onCloseCreate: () => void;
    newLevelTitle: string;
    onNewLevelTitleChange: (title: string) => void;
    onCreateLevel: () => void;

    // Edit Level Dialog
    showEditDialog: boolean;
    onCloseEdit: () => void;
    editLevelTitle: string;
    onEditLevelTitleChange: (title: string) => void;
    onSaveEdit: () => void;

    // Delete Level Dialog
    showDeleteDialog: boolean;
    onCloseDelete: () => void;
    levelToDelete: any;
    onConfirmDelete: () => void;
}

export function LevelDialogs({
    showCreateDialog,
    onCloseCreate,
    newLevelTitle,
    onNewLevelTitleChange,
    onCreateLevel,
    showEditDialog,
    onCloseEdit,
    editLevelTitle,
    onEditLevelTitleChange,
    onSaveEdit,
    showDeleteDialog,
    onCloseDelete,
    levelToDelete,
    onConfirmDelete,
}: LevelDialogsProps) {
    return (
        <>
            {/* Create Level Dialog */}
            {showCreateDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Tạo Cấp độ Mới</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiêu đề Cấp độ
                                </label>
                                <Input
                                    value={newLevelTitle}
                                    onChange={(e) => onNewLevelTitleChange(e.target.value)}
                                    placeholder="Nhập tiêu đề cấp độ (ví dụ: Cấp độ 1)"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button onClick={onCloseCreate} variant="outline" className="flex-1">
                                Hủy
                            </Button>
                            <Button onClick={onCreateLevel} className="flex-1">
                                Tạo
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Level Dialog */}
            {showEditDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Chỉnh sửa Cấp độ</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiêu đề Cấp độ
                                </label>
                                <Input
                                    value={editLevelTitle}
                                    onChange={(e) => onEditLevelTitleChange(e.target.value)}
                                    placeholder="Nhập tiêu đề cấp độ"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button onClick={onCloseEdit} variant="outline" className="flex-1">
                                Hủy
                            </Button>
                            <Button onClick={onSaveEdit} className="flex-1">
                                Lưu
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Level Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4 text-red-600">Xóa Cấp độ</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa <strong>{levelToDelete?.title}</strong>?
                            <br />
                            Tất cả bài học trong cấp độ này sẽ bị xóa khỏi lộ trình.
                        </p>
                        <div className="flex gap-3">
                            <Button onClick={onCloseDelete} variant="outline" className="flex-1">
                                Hủy
                            </Button>
                            <Button onClick={onConfirmDelete} className="flex-1 bg-red-600 hover:bg-red-700">
                                Xóa
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
