"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray, Control, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { wordService } from "@/services/word.service";
import { categoryService } from "@/services/category.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

// --- Zod Schema (Updated to match Server Joi) ---
const wordSchema = z.object({
  word: z.string().min(1, "Word is required").trim().toLowerCase(),
  pronunciation: z
    .string()
    .trim()
    .regex(/^\/.*\/$/, "Pronunciation must start and end with / (e.g., /həˈloʊ/)")
    .optional()
    .or(z.literal("")),
  audio: z.string().trim().url("Invalid audio URL").optional().or(z.literal("")),
  partOfSpeech: z.enum([
    "noun",
    "verb",
    "adjective",
    "adverb",
    "preposition",
    "conjunction",
    "interjection",
    "pronoun",
  ]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  frequency: z.coerce.number().min(0).default(0), // Coerce to handle input type="number" strings
  definitions: z
    .array(
      z.object({
        meaning: z.string().min(1, "Meaning is required"),
        meaningVi: z.string().min(1, "Vietnamese meaning is required"),
        examples: z
          .array(
            z.object({
              sentence: z.string(),
              translation: z.string(),
            })
          )
          .optional(),
      })
    )
    .min(1, "At least one definition is required"),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
  relatedWords: z.array(z.string()).optional(),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  tags: z.array(z.string()).optional(),
  image: z.string().trim().url("Invalid image URL").optional().or(z.literal("")),
  difficulty: z.coerce.number().min(1).max(5).default(1),

});

type WordFormData = z.infer<typeof wordSchema>;

// --- Sub-component for Nested Examples ---
// Tách ra để dùng useFieldArray cho cấp độ con (Examples)
const DefinitionCard = ({
  index,
  removeDefinition,
}: {
  index: number;
  removeDefinition: (index: number) => void;
}) => {
  const { control } = useFormContext<WordFormData>(); // Lấy context từ Form cha
  
  const {
    fields: exampleFields,
    append: appendExample,
    remove: removeExample,
  } = useFieldArray({
    control,
    name: `definitions.${index}.examples`,
  });

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-slate-50 dark:bg-slate-900/50">
      <div className="flex items-center justify-between border-b pb-2">
        <h4 className="font-medium text-lg text-primary">Definition {index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700 hover:bg-red-100"
          onClick={() => removeDefinition(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`definitions.${index}.meaning`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meaning (English) *</FormLabel>
              <FormControl>
                <Textarea placeholder="English definition..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`definitions.${index}.meaningVi`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meaning (Vietnamese) *</FormLabel>
              <FormControl>
                <Textarea placeholder="Nghĩa tiếng Việt..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Nested Examples Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <FormLabel className="text-xs uppercase text-muted-foreground font-bold">Examples</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => appendExample({ sentence: "", translation: ""})}
          >
            <Plus className="mr-1 h-3 w-3" /> Add Example
          </Button>
        </div>
        
        {exampleFields.map((example, k) => (
          <div key={example.id} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded bg-background relative group">
            <FormField
              control={control}
              name={`definitions.${index}.examples.${k}.sentence`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Example sentence (EN)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={control}
              name={`definitions.${index}.examples.${k}.translation`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Dịch câu ví dụ (VI)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeExample(k)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {exampleFields.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No examples added yet.</p>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function CreateWordPage() {
  const router = useRouter();
  
  // State for dynamic inputs (Tags, Synonyms, etc.)
  const [synonymInput, setSynonymInput] = useState("");
  const [antonymInput, setAntonymInput] = useState("");
  const [relatedWordInput, setRelatedWordInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const form = useForm<WordFormData>({
    resolver: zodResolver(wordSchema),
    defaultValues: {
      word: "",
      pronunciation: "",
      audio: "",
      partOfSpeech: "noun",
      level: "beginner",
      frequency: 0,
      definitions: [
        {
          meaning: "",
          meaningVi: "",
          examples: [{ sentence: "", translation: "" }],
        },
      ],
      synonyms: [],
      antonyms: [],
      relatedWords: [], // Added
      categories: [],
      tags: [],
      image: "",
      difficulty: 1,
    },
  });

  const {
    fields: definitionFields,
    append: appendDefinition,
    remove: removeDefinition,
  } = useFieldArray({
    control: form.control,
    name: "definitions",
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.listCategories(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: WordFormData) => wordService.createWord(data),
    onSuccess: () => {
      toast.success("Word created successfully!");
      router.push("/admin/words");
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Failed to create word");
    },
  });

  const onSubmit = (data: WordFormData) => {
    // Clean up empty strings in arrays if necessary, though Zod handles validation
    createMutation.mutate(data);
  };

  const categories = categoriesData?.data || [];

  // Helper functions for Array Inputs (Synonyms, etc.)
  const handleArrayInputAdd = (
    field: "synonyms" | "antonyms" | "relatedWords" | "tags",
    value: string,
    setter: (val: string) => void
  ) => {
    if (value.trim()) {
      const current = form.getValues(field) || [];
      if (!current.includes(value.trim())) {
        form.setValue(field, [...current, value.trim()]);
        setter("");
      } else {
        toast.error("Item already exists");
      }
    }
  };

  const handleArrayInputRemove = (
    field: "synonyms" | "antonyms" | "relatedWords" | "tags",
    index: number
  ) => {
    const current = form.getValues(field) || [];
    form.setValue(
      field,
      current.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6 container mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/words">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Word</h1>
          <p className="text-muted-foreground">
            Add a new word to the vocabulary database
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* 1. Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="word"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Word *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., hello" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pronunciation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pronunciation (IPA)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., /həˈloʊ/" {...field} />
                      </FormControl>
                      <FormDescription>Must be enclosed in slashes.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="partOfSpeech"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part of Speech *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["noun", "verb", "adjective", "adverb", "preposition", "conjunction", "interjection", "pronoun"].map(pos => (
                             <SelectItem key={pos} value={pos} className="capitalize">{pos}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty (1-5)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                 <FormField
                    control={form.control}
                    name="audio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audio URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
            </CardContent>
          </Card>

          {/* 2. Definitions & Examples (Refactored) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Definitions & Examples *</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendDefinition({
                    meaning: "",
                    meaningVi: "",
                    examples: [{ sentence: "", translation: "" }],
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Add Definition
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {definitionFields.map((field, index) => (
                <DefinitionCard 
                  key={field.id} 
                  index={index} 
                  removeDefinition={removeDefinition} 
                />
              ))}
              {definitionFields.length === 0 && (
                 <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    No definitions added. Please add at least one.
                 </div>
              )}
               <FormMessage>{form.formState.errors.definitions?.message}</FormMessage>
            </CardContent>
          </Card>

          {/* 3. Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories *</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="categories"
                render={() => (
                  <FormItem>
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                      {categories.map((category: any) => (
                        <FormField
                          key={category._id}
                          control={form.control}
                          name="categories"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category._id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, category._id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== category._id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer text-sm">
                                {category.name}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 4. Relations & Tags (Synonyms, Antonyms, Related, Tags) */}
          <Card>
            <CardHeader>
              <CardTitle>Relations & Meta</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              
              {/* Synonyms */}
              <div className="space-y-2">
                <FormLabel>Synonyms</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add synonym..."
                    value={synonymInput}
                    onChange={(e) => setSynonymInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleArrayInputAdd("synonyms", synonymInput, setSynonymInput))}
                  />
                  <Button type="button" variant="secondary" onClick={() => handleArrayInputAdd("synonyms", synonymInput, setSynonymInput)}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("synonyms")?.map((syn, i) => (
                    <Badge key={i} variant="secondary">
                      {syn}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleArrayInputRemove("synonyms", i)} />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Antonyms */}
              <div className="space-y-2">
                <FormLabel>Antonyms</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add antonym..."
                    value={antonymInput}
                    onChange={(e) => setAntonymInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleArrayInputAdd("antonyms", antonymInput, setAntonymInput))}
                  />
                  <Button type="button" variant="secondary" onClick={() => handleArrayInputAdd("antonyms", antonymInput, setAntonymInput)}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("antonyms")?.map((ant, i) => (
                    <Badge key={i} variant="secondary">
                      {ant}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleArrayInputRemove("antonyms", i)} />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Related Words (Added) */}
              <div className="space-y-2">
                <FormLabel>Related Words</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add related word..."
                    value={relatedWordInput}
                    onChange={(e) => setRelatedWordInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleArrayInputAdd("relatedWords", relatedWordInput, setRelatedWordInput))}
                  />
                  <Button type="button" variant="secondary" onClick={() => handleArrayInputAdd("relatedWords", relatedWordInput, setRelatedWordInput)}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("relatedWords")?.map((word, i) => (
                    <Badge key={i} variant="secondary">
                      {word}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleArrayInputRemove("relatedWords", i)} />
                    </Badge>
                  ))}
                </div>
              </div>

               {/* Tags (Fixed UI) */}
               <div className="space-y-2">
                <FormLabel>Tags</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleArrayInputAdd("tags", tagInput, setTagInput))}
                  />
                  <Button type="button" variant="secondary" onClick={() => handleArrayInputAdd("tags", tagInput, setTagInput)}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("tags")?.map((tag, i) => (
                    <Badge key={i} variant="outline" className="bg-primary/5">
                      #{tag}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleArrayInputRemove("tags", i)} />
                    </Badge>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex justify-end space-x-4 sticky bottom-4 p-4 bg-background/80 backdrop-blur-sm border rounded-lg shadow-sm">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Word"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}