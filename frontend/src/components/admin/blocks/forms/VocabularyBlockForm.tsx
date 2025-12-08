"use client";

import { RefPicker } from "../shared/RefPicker";

export interface VocabularyBlockFormData {
    cardDeck: string;
}

interface VocabularyBlockFormProps {
    data: VocabularyBlockFormData;
    onChange: (data: Partial<VocabularyBlockFormData>) => void;
}

export function VocabularyBlockForm({ data, onChange }: VocabularyBlockFormProps) {
    return (
        <div className="space-y-4">
            <RefPicker
                type="cardDeck"
                value={data.cardDeck || ""}
                onChange={(cardDeckId) => onChange({ cardDeck: cardDeckId })}
                label="Bộ thẻ từ vựng"
                required={true}
            />
            {!data.cardDeck && (
                <p className="text-sm text-gray-500 italic">
                    Vui lòng chọn một bộ thẻ từ vựng. Nếu chưa có, hãy tạo bộ thẻ mới trước.
                </p>
            )}
        </div>
    );
}

