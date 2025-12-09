import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}

export function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    disabled = false,
}: PaginationControlsProps) {
    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(1)}
                disabled={!canGoPrevious || disabled}
                title="First page"
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!canGoPrevious || disabled}
                title="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 px-4">
                <span className="text-sm text-slate-600">
                    Page <span className="font-semibold">{currentPage}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                </span>
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!canGoNext || disabled}
                title="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(totalPages)}
                disabled={!canGoNext || disabled}
                title="Last page"
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
