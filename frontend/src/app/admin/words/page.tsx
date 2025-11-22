// src/app/admin/words/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wordService } from "@/services/word.service";
import { categoryService } from "@/services/category.service";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  Edit,
  Trash2,
  Volume2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function WordsListPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });

  // Fetch words
  const { data: wordsData, isLoading } = useQuery({
    queryKey: ["words", searchQuery, categoryFilter, levelFilter],
    queryFn: async () => {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (levelFilter !== "all") params.level = levelFilter;

      return await wordService.getAllWords(params);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => wordService.deleteWord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["words"] });
      toast.success("Word deleted successfully!");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete word");
    },
  });

  // Export sample Excel
  const handleExportSample = async () => {
    try {
      const blob = await wordService.exportSample();
      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sample_words.xlsx";
      a.click();
      toast.success("Sample file downloaded!");
    } catch (error) {
      toast.error("Failed to download sample");
    }
  };

  const levels = ["beginner", "intermediate", "advanced"];
  const categories = categoriesData?.data || [];
  const words = wordsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Words Management</h1>
          <p className="text-gray-500">Manage vocabulary database</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleExportSample}>
            <Download className="mr-2 h-4 w-4" />
            Download Sample
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/words/import">
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/words/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Word
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Level Filter */}
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Word</TableHead>
              <TableHead>Pronunciation</TableHead>
              <TableHead>Part of Speech</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : words.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  No words found
                </TableCell>
              </TableRow>
            ) : (
              words.map((word: any) => (
                <TableRow key={word._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{word.word}</span>
                      {word.audio && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => new Audio(word.audio).play()}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {word.pronunciation || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{word.partOfSpeech}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        word.level === "beginner"
                          ? "default"
                          : word.level === "intermediate"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {word.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {word.categories?.slice(0, 2).map((cat: any) => (
                        <Badge
                          key={cat._id}
                          variant="outline"
                          className="text-xs"
                        >
                          {cat.name}
                        </Badge>
                      ))}
                      {word.categories?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{word.categories.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/words/${word._id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(word._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Word</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this word? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
