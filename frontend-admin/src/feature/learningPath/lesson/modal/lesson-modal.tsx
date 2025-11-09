"use client";

import React, { useEffect, useCallback } from "react";
import { useAddLessonMutation, useUpdateLessonMutation } from "@/store/api/lesson-api";
import { FormModal } from "@/components/ui/form-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SelectPopover } from "@/components/ui/select-popover";
import { Lesson, LessonUpdateBody } from "@/types/response/lesson";
import { Category } from "@/types/response/category";
export const mockLessons = [
  { id: "673b5c2f9c9278e4d5c7f8a1", title: "Grammar Basics" },
  { id: "673b5c2f9c9278e4d5c7f8a2", title: "Vocabulary Practice" },
  { id: "673b5c2f9c9278e4d5c7f8a3", title: "Listening Exercise" },
  { id: "673b5c2f9c9278e4d5c7f8a4", title: "Speaking Workshop" },
  { id: "673b5c2f9c9278e4d5c7f8a5", title: "Reading Comprehension" },
];

export const mockCategories = [
  { id: "673b5c2f9c9278e4d5c7f8b1", name: "Ngữ pháp (Grammar)" },
  { id: "673b5c2f9c9278e4d5c7f8b2", name: "Từ vựng (Vocabulary)" },
  { id: "673b5c2f9c9278e4d5c7f8b3", name: "Nghe hiểu (Listening)" },
  { id: "673b5c2f9c9278e4d5c7f8b4", name: "Nói (Speaking)" },
  { id: "673b5c2f9c9278e4d5c7f8b5", name: "Đọc hiểu (Reading)" },
];

const lessonFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  skill: z.string().min(1, "Vui lòng chọn kỹ năng"),
  topic: z.string().min(1, "Chủ đề không được để trống"),
  level: z.string().min(1, "Vui lòng chọn cấp độ"),
  duration_minutes: z.number({ invalid_type_error: "Thời lượng phải là số" }).min(1, "Thời lượng phải lớn hơn 0"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  prerequisites: z.array(z.string()).optional(),
  thumbnail: z.string().url().optional(),
  status: z.string().optional(),
  // You may paste blocks JSON here (optional). We'll parse it when submitting the update.
  blocksJson: z.string().optional(),
});

type LessonFormValues = z.infer<typeof lessonFormSchema>;

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  lesson?: any | null;
  categories: Category[];
}

export const LessonModal: React.FC<LessonModalProps> = ({ isOpen, onClose, mode, lesson, categories }) => {
  const [addLesson, { isLoading: isAdding }] = useAddLessonMutation();
  const [updateLesson, { isLoading: isUpdating }] = useUpdateLessonMutation();

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: "",
      description: "",
      skill: "",
      topic: "",
      level: "",
      duration_minutes: 0,
      categoryId: "",
      prerequisites: [],
    },
  });

  const categoryForSelect = categories.map((cate) => ({
    id: cate._id,
    name: cate.name, // Ưu tiên nameVi nếu có
  }));

  const { reset, handleSubmit } = form;

  // Load data khi edit
  const getData = useCallback(() => {
    if (mode === "edit" && lesson) {
      reset({
        title: lesson.title ?? "",
        description: lesson.description ?? "",
        skill: lesson.skill ?? "",
        topic: lesson.topic ?? "",
        level: lesson.level ?? "",
        duration_minutes: lesson.duration_minutes ?? 0,
        categoryId: lesson.categoryId ?? "",
        prerequisites: lesson.prerequisites ?? [],
      });
    } else {
      reset({
        title: "",
        description: "",
        skill: "",
        topic: "",
        level: "",
        duration_minutes: 0,
        categoryId: "",
        prerequisites: [],
      });
    }
  }, [mode, lesson, reset]);

  useEffect(() => {
    if (isOpen) {
      getData();
    }
  }, [isOpen, getData]);

  // Xử lý submit
  const onSubmit = async (values: LessonFormValues) => {
    console.log("mode", mode);
    try {
      if (mode === "add") {
        const response = await addLesson({ body: values as any }).unwrap();
        console.log("add response", response);
        toast.success(response.message ?? "Thêm bài học thành công!");
      } else if (mode === "edit" && lesson?._id) {
        await updateLesson({ body: values as any, lessonId: lesson._id }).unwrap();
        toast.success("Cập nhật bài học thành công!");
      }

      onClose();
      reset();
    } catch (err: any) {
      console.log("error", err);
      toast.error(err?.data?.message ?? err?.message ?? "Có lỗi xảy ra khi lưu bài học");
    }
  };

  const title = mode === "add" ? "Thêm mới bài học" : `Chỉnh sửa bài học "${lesson?.title}"`;

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title={title} onSubmit={handleSubmit(onSubmit)}>
      <FormProvider {...form}>
        <Form {...form}>
          <form className="space-y-4">
            {/* Tiêu đề */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tiêu đề<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập tiêu đề bài học" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mô tả */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mô tả<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Nhập mô tả ngắn cho bài học" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Skill */}
              <FormField
                control={form.control}
                name="skill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kỹ năng<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={(val) => field.onChange(val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn kỹ năng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reading">Reading</SelectItem>
                          <SelectItem value="writing">Writing</SelectItem>
                          <SelectItem value="listening">Listening</SelectItem>
                          <SelectItem value="speaking">Speaking</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Level */}
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cấp độ<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={(val) => field.onChange(val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn cấp độ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Chủ đề */}
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Chủ đề<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập chủ đề (VD: Grammar, Vocabulary...)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Thời lượng */}
            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Thời lượng (phút)<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="VD: 30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Danh mục */}
            <SelectPopover
              control={form.control}
              name="categoryId"
              label="Danh mục"
              options={categoryForSelect}
              placeholder="Chọn danh mục"
              required
              multiple={false} // chỉ chọn 1
            />

            <SelectPopover
              control={form.control}
              name="prerequisites"
              label="Bài học tiên quyết (Prerequisites)"
              options={mockLessons}
              placeholder="Chọn bài học tiên quyết"
              multiple={true} // chọn nhiều
            />
          </form>
        </Form>
      </FormProvider>
    </FormModal>
  );
};
