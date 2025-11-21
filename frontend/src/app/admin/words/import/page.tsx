// src/app/admin/words/import/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { wordService } from "@/services/word.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default function ImportWordsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const importMutation = useMutation({
    mutationFn: (file: File) => wordService.importWords(file),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Import completed!");
    },
    onError: () => {
      toast.error("Import failed");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Please upload an Excel file (.xlsx or .xls)");
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = () => {
    if (!file) return;
    importMutation.mutate(file);
  };

  const downloadSample = async () => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/words">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Import Words from Excel</h1>
          <p className="text-gray-500">Bulk upload words using Excel file</p>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Download the sample Excel file template</li>
            <li>Fill in your words data following the template format</li>
            <li>Upload the completed Excel file</li>
            <li>Review the import results</li>
          </ol>
          <Button onClick={downloadSample} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Sample Template
          </Button>
        </CardContent>
      </Card>

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileSpreadsheet className="w-12 h-12 mb-4 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  Excel files only (.xlsx, .xls)
                </p>
                {file && (
                  <p className="mt-4 text-sm font-medium text-sky-600">
                    {file.name}
                  </p>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <Button
            onClick={handleImport}
            disabled={!file || importMutation.isPending}
            className="w-full"
          >
            {importMutation.isPending ? (
              "Importing..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Words
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {result.successCount || 0}
                    </p>
                    <p className="text-sm text-gray-500">Successful</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {result.failedCount || 0}
                    </p>
                    <p className="text-sm text-gray-500">Failed</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {result.duplicateCount || 0}
                    </p>
                    <p className="text-sm text-gray-500">Duplicates</p>
                  </div>
                </div>
              </div>
            </div>

            {result.failedRecords?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Failed Records:</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {result.failedRecords.map((record: any, i: number) => (
                    <div
                      key={i}
                      className="rounded border border-red-200 bg-red-50 p-3 text-sm"
                    >
                      <p className="font-medium">
                        Row {record.row}: {record.word}
                      </p>
                      <p className="text-red-600">{record.error.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => router.push("/admin/words")}
              className="w-full"
            >
              View All Words
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
