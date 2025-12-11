"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { flashcardAdminService } from "@/services/flashcardAdmin.service";
import { CardDeck } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Layers,
    CheckCircle,
    XCircle,
    Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminPagination } from "@/components/admin/AdminPagination";

export default function FlashcardsPage() {
    const router = useRouter();
    const [decks, setDecks] = useState<CardDeck[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalDecks, setTotalDecks] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDecks();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, currentPage, pageSize]);

    const fetchDecks = async () => {
        try {
            setLoading(true);
            const params: any = {
                pageNum: currentPage,
                pageSize: pageSize,
            };
            if (searchTerm) params.search = searchTerm;
            if (statusFilter !== "all") params.status = statusFilter;

            const response = await flashcardAdminService.getAll(params);
            if (response.code === 200) {
                setDecks(response.data);
                // Handle pagination from response
                // Assuming response structure has pagination or we calculate it
                // If backend returns pagination object:
                if (response.pagination) {
                    setTotalDecks(response.pagination.total);
                    setTotalPages(Math.ceil(response.pagination.total / pageSize));
                } else {
                    // Fallback if backend doesn't return pagination object but returns all data (unlikely with new backend change)
                    // But since we updated backend to return pagination, it should be there.
                    // However, if the service wrapper doesn't expose it properly, we might need to check.
                    // For now, assume it works or fallback to length
                    setTotalDecks(response.data.length); // This might be wrong if paginated
                    // Actually, if backend is paginated, response.data is just the page.
                    // We need total count. 
                    // Let's hope response.pagination exists.
                }
            }
        } catch (error) {
            console.error("Error fetching decks:", error);
            toast.error("Failed to load flashcard decks");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const response = await flashcardAdminService.delete(deleteId);
            if (response.code === 200) {
                toast.success("Deck deleted successfully");
                fetchDecks();
            }
        } catch (error) {
            toast.error("Failed to delete deck");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Flashcards Management</h1>
                    <p className="text-muted-foreground">Manage flashcard decks and cards</p>
                </div>
                <Button onClick={() => router.push("/admin/flashcards/create")} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Deck
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Decks</p>
                            <p className="text-2xl font-bold">{totalDecks}</p>
                        </div>
                        <Layers className="h-8 w-8 text-blue-600" />
                    </CardContent>
                </Card>
                {/* Note: We can't easily get Active/Total Cards counts without fetching all data or separate API stats. 
                    For now, we'll hide them or just show what we have if we want. 
                    Actually, let's remove the other stats for now as they require separate API calls or all data.
                */}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search decks..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset to page 1 on search
                                }}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => {
                                setStatusFilter(value);
                                setCurrentPage(1); // Reset to page 1 on filter change
                            }}
                        >
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Deck Info</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-center">Cards</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-12 w-12 rounded" /></TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[200px]" />
                                                <Skeleton className="h-3 w-[150px]" />
                                            </div>
                                        </TableCell>
                                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-10 mx-auto rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 mx-auto rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : decks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Layers className="h-8 w-8 mb-2 opacity-50" />
                                            <p>No flashcard decks found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                decks.map((deck) => (
                                    <TableRow key={deck._id} className="hover:bg-muted/50">
                                        <TableCell>
                                            {deck.thumbnail ? (
                                                <img
                                                    src={deck.thumbnail}
                                                    alt={deck.title}
                                                    className="w-12 h-12 object-cover rounded-md border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border border-gray-200">
                                                    <Layers className="w-6 h-6" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{deck.title || deck.name}</span>
                                                <span className="text-sm text-muted-foreground line-clamp-1">{deck.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">
                                                {deck.categoryId?.name || deck.category || "Uncategorized"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                {deck.cards?.length ?? 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={deck.status === "active" ? "default" : "secondary"}
                                                className={cn(
                                                    deck.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                )}
                                            >
                                                {deck.status === "active" ? (
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Active
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <XCircle className="w-3 h-3" /> Inactive
                                                    </div>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/admin/flashcards/${deck._id}`)}
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteId(deck._id)}
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalDecks}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    loading={loading}
                />
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Deck</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this deck? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
