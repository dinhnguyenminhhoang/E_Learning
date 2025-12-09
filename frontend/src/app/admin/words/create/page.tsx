"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Plus, X, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

const wordSchema = z.object({
  word: z.string().min(1, "Word is required"),
  pronunciation: z.string().optional(),
  audio: z.string().url().optional().or(z.literal("")),
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
  frequency: z.number().min(0),
  definitions: z
    .array(
      z.object({
        meaning: z.string().min(1, "Meaning is required"),
        meaningVi: z.string().min(1, "Vietnamese meaning is required"),
        examples: z.array(
          z.object({
            sentence: z.string(),
            translation: z.string(),
            audio: z.string().optional(),
          })
        ),
      })
    )
    .min(1, "At least one definition is required"),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
  relatedWords: z.array(z.string()).optional(),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  tags: z.array(z.string()).optional(),
  image: z.string().url().optional().or(z.literal("")),
  difficulty: z.number().min(1).max(5),
});

type WordFormData = z.infer<typeof wordSchema>;

export default function CreateWordPage() {
  const router = useRouter();
  const [synonymInput, setSynonymInput] = useState("");
  const [antonymInput, setAntonymInput] = useState("");
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
          examples: [{ sentence: "", translation: "", audio: "" }],
        },
      ],
      synonyms: [],
      antonyms: [],
      relatedWords: [],
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
    queryFn: () => categoryService.getAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: WordFormData) => wordService.createWord(data),
    onSuccess: () => {
      toast.success("Word created successfully!");
      router.push("/admin/words");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create word");
    },
  });

  const onSubmit = (data: WordFormData) => {
    createMutation.mutate(data);
  };

  const categories = categoriesData?.data || [];

  const addSynonym = () => {
    if (synonymInput.trim()) {
      const current = form.getValues("synonyms") || [];
      form.setValue("synonyms", [...current, synonymInput.trim()]);
      setSynonymInput("");
    }
  };

  const removeSynonym = (index: number) => {
    const current = form.getValues("synonyms") || [];
    form.setValue(
      "synonyms",
      current.filter((_, i) => i !== index)
    );
  };

  const addAntonym = () => {
    if (antonymInput.trim()) {
      const current = form.getValues("antonyms") || [];
      form.setValue("antonyms", [...current, antonymInput.trim()]);
      setAntonymInput("");
    }
  };

  const removeAntonym = (index: number) => {
    const current = form.getValues("antonyms") || [];
    form.setValue(
      "antonyms",
      current.filter((_, i) => i !== index)
    );
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const current = form.getValues("tags") || [];
      form.setValue("tags", [...current, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    const current = form.getValues("tags") || [];
    form.setValue(
      "tags",
      current.filter((_, i) => i !== index)
    );
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
          <h1 className="text-3xl font-bold">Create New Word</h1>
          <p className="text-gray-500">
            Add a new word to the vocabulary database
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="noun">Noun</SelectItem>
                          <SelectItem value="verb">Verb</SelectItem>
                          <SelectItem value="adjective">Adjective</SelectItem>
                          <SelectItem value="adverb">Adverb</SelectItem>
                          <SelectItem value="preposition">
                            Preposition
                          </SelectItem>
                          <SelectItem value="conjunction">
                            Conjunction
                          </SelectItem>
                          <SelectItem value="interjection">
                            Interjection
                          </SelectItem>
                          <SelectItem value="pronoun">Pronoun</SelectItem>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
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
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
            </CardContent>
          </Card>

          {/* Definitions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Definitions *</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendDefinition({
                      meaning: "",
                      meaningVi: "",
                      examples: [{ sentence: "", translation: "", audio: "" }],
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Definition
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {definitionFields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Definition {index + 1}</h4>
                    {definitionFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDefinition(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`definitions.${index}.meaning`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meaning (English) *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="English definition..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`definitions.${index}.meaningVi`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meaning (Vietnamese) *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nghĩa tiếng Việt..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Examples - tương tự structure như definitions */}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Categories */}
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
                    <div className="grid gap-3 md:grid-cols-3">
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
                                      ? field.onChange([
                                        ...field.value,
                                        category._id,
                                      ])
                                      : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== category._id
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
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

          {/* Synonyms & Antonyms */}
          <Card>
            <CardHeader>
              <CardTitle>Synonyms & Antonyms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <FormLabel>Synonyms</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add synonym..."
                    value={synonymInput}
                    onChange={(e) => setSynonymInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSynonym())
                    }
                  />
                  <Button type="button" onClick={addSynonym}>
                    Add
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.watch("synonyms")?.map((syn, i) => (
                    <Badge key={i} variant="secondary">
                      {syn}
                      <button
                        type="button"
                        onClick={() => removeSynonym(i)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <FormLabel>Antonyms</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add antonym..."
                    value={antonymInput}
                    onChange={(e) => setAntonymInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addAntonym())
                    }
                  />
                  <Button type="button" onClick={addAntonym}>
                    Add
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.watch("antonyms")?.map((ant, i) => (
                    <Badge key={i} variant="secondary">
                      {ant}
                      <button
                        type="button"
                        onClick={() => removeAntonym(i)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
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
