"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { flashcardAdminService } from "@/services/flashcardAdmin.service";
import { categoryService } from "@/services/category.service";
import { CardDeck } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function FlashcardDetailPage() {
    const router = useRouter();
    const params = useParams();
    const deckId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deck, setDeck] = useState<CardDeck | null>(null);
    const [categories, setCategories] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        categoryId: "",
        thumbnail: "",
        level: "beginner",
        status: "active" as "active" | "inactive",
    });

    const [cards, setCards] = useState<any[]>([]);
    const [newCard, setNewCard] = useState({ front: "", back: "" });
    const [showAddCard, setShowAddCard] = useState(false);

    useEffect(() => {
        fetchData();
    }, [deckId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deckRes, catRes] = await Promise.all([
                flashcardAdminService.getById(deckId),
                categoryService.getAll(),
            ]);

            if (deckRes.code === 200 && (deckRes.data as any)?.cardDeck) {
                const deckData = (deckRes.data as any).cardDeck;
                setDeck(deckData);
                setFormData({
                    title: deckData.title || "",
                    description: deckData.description || "",
                    categoryId: deckData.categoryId?._id || deckData.categoryId || "",
                    thumbnail: deckData.thumbnail || "",
                    level: deckData.level || "beginner",
                    status: deckData.status || "active",
                });
                setCards(deckData.cards || []);
            } else {
                toast.error("Deck not found");
                router.push("/admin/flashcards");
            }

            if (catRes.code === 200) {
                setCategories(catRes.data || []);
            }
        } catch (error) {
            console.error("Error fetching deck:", error);
            toast.error("Failed to load deck");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Deck title is required");
            return;
        }

        try {
            setSaving(true);
            const response = await flashcardAdminService.update(deckId, {
                ...formData,
                cards: cards,
            });
            if (response.code === 200) {
                toast.success("Deck updated successfully!");
                router.push("/admin/flashcards");
            }
        } catch (error) {
            console.error("Error updating deck:", error);
            toast.error("Failed to update deck");
        } finally {
            setSaving(false);
        }
    };

    const handleAddCard = () => {
        if (!newCard.front.trim() || !newCard.back.trim()) {
            toast.error("Both front and back are required");
            return;
        }
        setCards([...cards, { ...newCard, _id: `temp-${Date.now()}` }]);
        setNewCard({ front: "", back: "" });
        setShowAddCard(false);
        toast.success("Card added");
    };

    const handleDeleteCard = (index: number) => {
        const updated = [...cards];
        updated.splice(index, 1);
        setCards(updated);
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-96">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!deck) return null;

    return (
        <div className="p-6 mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Flashcards
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Edit Flashcard Deck
                </h1>
                <p className="text-gray-600">Update deck information and manage cards</p>
            </div>

            {/* Deck Form */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Deck Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter deck title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Thumbnail URL
                            </label>
                            <Input
                                value={formData.thumbnail}
                                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                            {saving ? "Saving..." : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Cards Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Cards ({cards.length})</h2>
                        <p className="text-sm text-gray-600">Manage flashcards in this deck</p>
                    </div>
                    <Button onClick={() => setShowAddCard(!showAddCard)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Card
                    </Button>
                </div>

                {showAddCard && (
                    <div className="p-6 border-b bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Front</label>
                                <Input
                                    value={newCard.front}
                                    onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                                    placeholder="Front side content"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Back</label>
                                <Input
                                    value={newCard.back}
                                    onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                                    placeholder="Back side content"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleAddCard} size="sm">Add</Button>
                            <Button variant="outline" size="sm" onClick={() => setShowAddCard(false)}>Cancel</Button>
                        </div>
                    </div>
                )}

                <div className="divide-y">
                    {cards.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No cards yet. Add your first card!
                        </div>
                    ) : (
                        cards.map((card, index) => (
                            <div key={card._id || index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-gray-500">Front:</span>
                                        <p className="text-gray-900">{card.front}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Back:</span>
                                        <p className="text-gray-900">{card.back}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCard(index)}
                                    className="text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
