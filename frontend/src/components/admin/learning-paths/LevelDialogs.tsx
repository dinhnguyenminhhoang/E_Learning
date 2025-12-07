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
                        <h3 className="text-lg font-bold mb-4">Create New Level</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Level Title
                                </label>
                                <Input
                                    value={newLevelTitle}
                                    onChange={(e) => onNewLevelTitleChange(e.target.value)}
                                    placeholder="Enter level title (e.g. Level 1)"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button onClick={onCloseCreate} variant="outline" className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={onCreateLevel} className="flex-1">
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Level Dialog */}
            {showEditDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Edit Level</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Level Title
                                </label>
                                <Input
                                    value={editLevelTitle}
                                    onChange={(e) => onEditLevelTitleChange(e.target.value)}
                                    placeholder="Enter level title"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button onClick={onCloseEdit} variant="outline" className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={onSaveEdit} className="flex-1">
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Level Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4 text-red-600">Delete Level</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{levelToDelete?.title}</strong>?
                            <br />
                            All lessons in this level will be removed from the path.
                        </p>
                        <div className="flex gap-3">
                            <Button onClick={onCloseDelete} variant="outline" className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={onConfirmDelete} className="flex-1 bg-red-600 hover:bg-red-700">
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
