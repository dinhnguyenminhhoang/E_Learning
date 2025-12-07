"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ExamsListPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Exams</h1>
                    <p className="text-gray-600">Test your knowledge and earn certifications</p>
                </div>

                <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-8">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-yellow-900 mb-2">
                                    Backend API Not Fully Implemented
                                </h3>
                                <p className="text-yellow-800 mb-4">
                                    The exam list requires the following backend endpoint:
                                </p>
                                <ul className="list-disc list-inside text-yellow-800 space-y-1 text-sm">
                                    <li>GET /v1/api/exam - List all available exams</li>
                                </ul>
                                <p className="text-yellow-800 mt-4">
                                    Once this endpoint is implemented, you'll be able to view and start exams from this page.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
