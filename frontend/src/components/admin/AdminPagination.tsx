import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    loading?: boolean;
}

export function AdminPagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    loading = false,
}: AdminPaginationProps) {
    if (totalItems === 0) return null;

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
                Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1 || loading}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                </Button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5) {
                            if (currentPage > 3) pageNum = currentPage - 2 + i;
                            if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                            // Ensure pageNum is within bounds (e.g. if currentPage is near end)
                            if (pageNum < 1) pageNum = i + 1; // Fallback
                        }

                        // Re-calculate logic to be robust
                        // If totalPages <= 5, show 1..totalPages
                        // If totalPages > 5:
                        //   If currentPage <= 3, show 1..5
                        //   If currentPage >= totalPages - 2, show totalPages-4..totalPages
                        //   Else show currentPage-2..currentPage+2

                        if (totalPages > 5) {
                            if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                        } else {
                            pageNum = i + 1;
                        }

                        return (
                            <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                className={cn("w-8 h-8 p-0", currentPage === pageNum && "bg-blue-600 hover:bg-blue-700")}
                                onClick={() => onPageChange(pageNum)}
                                disabled={loading}
                            >
                                {pageNum}
                            </Button>
                        );
                    })}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages || loading}
                >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
