"use client";

import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VocabularyFormProps {
    cardDeck: string;
    cardDecks: any[];
    onChange: (cardDeck: string) => void;
}

export function VocabularyForm({ cardDeck, cardDecks, onChange }: VocabularyFormProps) {
    return (
        <div>
            <label className="block text-sm font-medium mb-2">
                Card Deck <span className="text-red-500">*</span>
            </label>
            <select
                value={cardDeck}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
                <option value="">-- Select a Card Deck --</option>
                {cardDecks.map((deck) => (
                    <option key={deck._id} value={deck._id}>
                        {deck.name || deck.title}
                    </option>
                ))}
            </select>
            {cardDecks.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                    No card decks found. Create one first.
                </p>
            )}
        </div>
    );
}
