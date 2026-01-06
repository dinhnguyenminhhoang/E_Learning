"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { flashcardAdminService } from "@/services/flashcardAdmin.service";
import { categoryService } from "@/services/category.service";
import { wordService, type Word } from "@/services/word.service";
import { chunkedUploadService } from "@/services/chunkedUpload.service";
import { CardDeck } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Tag,
    X,
    ChevronsUpDown,
    Check,
    Upload,
    Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

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
        level: "beginner" as "beginner" | "intermediate" | "advanced",
        difficulty: "medium" as "easy" | "medium" | "hard",
        tags: [] as string[],
        isPublic: true,
        status: "active" as "active" | "inactive",
    });

    const [tagInput, setTagInput] = useState("");
    const [cards, setCards] = useState<any[]>([]);
    const [newCard, setNewCard] = useState({ front: "", back: "", word: "", images: [] as string[] });
    const [showAddCard, setShowAddCard] = useState(false);

    // Image upload for flashcards
    const [uploadingCardImage, setUploadingCardImage] = useState(false);
    const [cardImageProgress, setCardImageProgress] = useState(0);

    // Word selector states
    const [words, setWords] = useState<Word[]>([]);
    const [wordSearch, setWordSearch] = useState("");
    const [loadingWords, setLoadingWords] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);

    // Thumbnail upload states
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        fetchData();
        fetchWords(); // Load words when component mounts
    }, [deckId]);

    // Fetch words with search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchWords();
        }, 300);
        return () => clearTimeout(timer);
    }, [wordSearch]);

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
                    difficulty: deckData.difficulty || "medium",
                    tags: deckData.tags || [],
                    isPublic: deckData.isPublic ?? true,
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

            // Remove empty thumbnail to avoid validation errors
            // Don't send cards array - cards are created separately via FlashCard API
            const submitData: any = {
                ...formData,
            };
            if (!submitData.thumbnail || submitData.thumbnail.trim() === '') {
                delete submitData.thumbnail;
            }

            const response = await flashcardAdminService.update(deckId, submitData);
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

    const fetchWords = async () => {
        try {
            setLoadingWords(true);
            const response = await wordService.getAllWords({
                search: wordSearch,
                pageSize: 100
            });
            if (response.code === 200) {
                setWords(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching words:", error);
        } finally {
            setLoadingWords(false);
        }
    };

    const handleAddCard = async () => {
        if (!newCard.front.trim() || !newCard.back.trim()) {
            toast.error("Both front and back are required");
            return;
        }
        if (!newCard.word) {
            toast.error("Please select a word");
            return;
        }

        try {
            // Create flashcard via API immediately
            const response = await flashcardAdminService.createFlashcard({
                word: newCard.word,
                frontText: newCard.front,
                backText: newCard.back,
                cardDeck: deckId,
                images: newCard.images.filter(img => img.trim() !== ''),
                difficulty: formData.difficulty || 'easy',
                tags: formData.tags || [],
            });

            if (response.code === 200 || response.code === 201) {
                // Add the created card to local state for display
                setCards([...cards, {
                    _id: response.data._id,
                    front: newCard.front,
                    back: newCard.back,
                }]);
                setNewCard({ front: "", back: "", word: "", images: [] });
                setShowAddCard(false);
                toast.success("Card added successfully!");
            }
        } catch (error) {
            console.error("Error creating flashcard:", error);
            toast.error("Failed to add card");
        }
    };

    const handleDeleteCard = async (index: number) => {
        const card = cards[index];
        if (!card._id) return;

        try {
            const response = await flashcardAdminService.deleteFlashcard(card._id);
            if (response.code === 200) {
                const updated = [...cards];
                updated.splice(index, 1);
                setCards(updated);
                toast.success("Card deleted successfully!");
            }
        } catch (error) {
            console.error("Error deleting flashcard:", error);
            toast.error("Failed to delete card");
        }
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({
                    ...formData,
                    tags: [...formData.tags, tagInput.trim()],
                });
            }
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter((tag) => tag !== tagToRemove),
        });
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image size must be less than 10MB');
            return;
        }

        try {
            setUploadingThumbnail(true);
            setUploadProgress(0);

            const result = await chunkedUploadService.uploadFile(
                file,
                'IMAGE',
                {
                    folder: 'flashcard-thumbnails',
                    onProgress: (progress) => {
                        setUploadProgress(progress);
                    },
                }
            );

            setFormData({
                ...formData,
                thumbnail: result.url,
            });

            toast.success('Thumbnail uploaded successfully!');
        } catch (error) {
            console.error('Error uploading thumbnail:', error);
            toast.error('Failed to upload thumbnail');
        } finally {
            setUploadingThumbnail(false);
            setUploadProgress(0);
        }
    };

    const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image size must be less than 10MB');
            return;
        }

        try {
            setUploadingCardImage(true);
            setCardImageProgress(0);

            const result = await chunkedUploadService.uploadFile(
                file,
                'IMAGE',
                {
                    folder: 'flashcard-images',
                    onProgress: (progress) => {
                        setCardImageProgress(progress);
                    },
                }
            );

            // Add image to newCard images array
            setNewCard({
                ...newCard,
                images: [...newCard.images, result.url],
            });

            toast.success('Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploadingCardImage(false);
            setCardImageProgress(0);
            // Reset file input
            e.target.value = '';
        }
    };

    const handleRemoveCardImage = (index: number) => {
        setNewCard({
            ...newCard,
            images: newCard.images.filter((_, i) => i !== index),
        });
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
                                Level
                            </label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value as "beginner" | "intermediate" | "advanced" })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Difficulty
                            </label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as "easy" | "medium" | "hard" })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Thumbnail Image
                            </label>
                            <div className="space-y-3">
                                {/* Current Thumbnail Preview */}
                                {formData.thumbnail && (
                                    <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                                        <img
                                            src={formData.thumbnail}
                                            alt="Thumbnail preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, thumbnail: "" })}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Upload Button */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailUpload}
                                        disabled={uploadingThumbnail}
                                        className="hidden"
                                        id="thumbnail-upload"
                                    />
                                    <label
                                        htmlFor="thumbnail-upload"
                                        className={cn(
                                            "flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                                            uploadingThumbnail
                                                ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                                                : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                                        )}
                                    >
                                        {uploadingThumbnail ? (
                                            <>
                                                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                                                <span className="text-sm text-gray-600">
                                                    Uploading... {uploadProgress}%
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">
                                                    {formData.thumbnail ? "Change thumbnail" : "Upload thumbnail"}
                                                </span>
                                            </>
                                        )}
                                    </label>
                                </div>

                                {/* Upload Progress Bar */}
                                {uploadingThumbnail && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                )}

                                <p className="text-xs text-gray-500">
                                    Supported: JPG, PNG, GIF (max 10MB)
                                </p>
                            </div>
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

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Tag className="w-4 h-4 inline mr-1" />
                            Tags
                        </label>
                        <Input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Type a tag and press Enter"
                        />
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {formData.tags.map((tag, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-2 hover:text-blue-900"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isPublic}
                                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm font-semibold text-gray-700">
                                Make this deck public
                            </span>
                        </label>
                        <p className="text-xs text-gray-500 ml-6 mt-1">
                            Public decks can be viewed and studied by all users
                        </p>
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
                        <div className="grid grid-cols-1 gap-4 mb-4">
                            {/* Word Selector with Combobox */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Word <span className="text-red-500">*</span>
                                </label>
                                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCombobox}
                                            className="w-full justify-between"
                                        >
                                            {newCard.word
                                                ? words.find((word) => word._id === newCard.word)?.word
                                                : "Select word..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[500px] p-0" align="start">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search words..."
                                                value={wordSearch}
                                                onValueChange={setWordSearch}
                                            />
                                            <CommandList className="max-h-[400px] overflow-y-auto">
                                                <CommandEmpty>
                                                    {loadingWords ? "Loading..." : "No word found."}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {words.map((word) => (
                                                        <CommandItem
                                                            key={word._id}
                                                            value={word.word}
                                                            onSelect={() => {
                                                                setNewCard({
                                                                    ...newCard,
                                                                    word: word._id,
                                                                    front: word.word,
                                                                    back: word.definitions[0]?.meaningVi || ""
                                                                });
                                                                setOpenCombobox(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    newCard.word === word._id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{word.word}</span>
                                                                <span className="text-xs text-gray-500">
                                                                    {word.definitions[0]?.meaningVi || "No definition"}
                                                                </span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {newCard.word && (
                                    <p className="text-xs text-green-600 mt-1">
                                        ✓ Selected: {words.find(w => w._id === newCard.word)?.word}
                                    </p>
                                )}
                            </div>

                            {/* Front and Back Text */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Front Text <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={newCard.front}
                                        onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                                        placeholder="Front side content"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Back Text <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={newCard.back}
                                        onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                                        placeholder="Back side content"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Card Images Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <ImageIcon className="w-4 h-4 inline mr-1" />
                                    Card Images (Optional)
                                </label>

                                {/* Image previews */}
                                {newCard.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        {newCard.images.map((imageUrl, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={imageUrl}
                                                    alt={`Card image ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCardImage(index)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload button */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCardImageUpload}
                                        disabled={uploadingCardImage}
                                        className="hidden"
                                        id="card-image-upload"
                                    />
                                    <label
                                        htmlFor="card-image-upload"
                                        className={cn(
                                            "flex items-center justify-center gap-2 w-full px-3 py-2 border border-dashed rounded-lg cursor-pointer transition-colors",
                                            uploadingCardImage
                                                ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                                                : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                                        )}
                                    >
                                        {uploadingCardImage ? (
                                            <>
                                                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                                                <span className="text-sm text-gray-600">
                                                    Uploading... {cardImageProgress}%
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">
                                                    Add image
                                                </span>
                                            </>
                                        )}
                                    </label>
                                </div>

                                {uploadingCardImage && (
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                        <div
                                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${cardImageProgress}%` }}
                                        />
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 mt-2">
                                    JPG, PNG, GIF (max 10MB) - You can add multiple images
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleAddCard} size="sm">Add Card</Button>
                            <Button variant="outline" size="sm" onClick={() => {
                                setShowAddCard(false);
                                setNewCard({ front: "", back: "", word: "", images: [] });
                                setWordSearch("");
                            }}>Cancel</Button>
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
                            <div key={card._id || index} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        {/* Front and Back Text */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs text-gray-500">Front:</span>
                                                <p className="text-gray-900">{card.front}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Back:</span>
                                                <p className="text-gray-900">{card.back}</p>
                                            </div>
                                        </div>

                                        {/* Card Images */}
                                        {card.images && card.images.length > 0 && (
                                            <div>
                                                <span className="text-xs text-gray-500 mb-1 block">
                                                    Images ({card.images.length}):
                                                </span>
                                                <div className="flex gap-2 flex-wrap">
                                                    {card.images.map((img: string, imgIdx: number) => (
                                                        <img
                                                            key={imgIdx}
                                                            src={img}
                                                            alt={`Card image ${imgIdx + 1}`}
                                                            className="w-16 h-16 object-cover rounded border border-gray-300"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
