"use client";

import { Input } from "@/components/ui/input";

interface MediaFormData {
    mediaType: "video" | "audio";
    sourceType: "upload" | "youtube";
    sourceUrl: string;
    transcript: string;
}

interface MediaFormProps {
    data: MediaFormData;
    onChange: (data: Partial<MediaFormData>) => void;
}

export function MediaForm({ data, onChange }: MediaFormProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Media Type</label>
                    <select
                        value={data.mediaType}
                        onChange={(e) => onChange({ mediaType: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Source Type</label>
                    <select
                        value={data.sourceType}
                        onChange={(e) => onChange({ sourceType: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="upload">Upload</option>
                        <option value="youtube">YouTube</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">
                    Source URL <span className="text-red-500">*</span>
                </label>
                <Input
                    value={data.sourceUrl}
                    onChange={(e) => onChange({ sourceUrl: e.target.value })}
                    placeholder="https://..."
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Transcript</label>
                <textarea
                    value={data.transcript}
                    onChange={(e) => onChange({ transcript: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                    placeholder="Add transcript for audio/video..."
                />
            </div>
        </div>
    );
}
