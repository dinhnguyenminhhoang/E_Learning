export interface Category {
  _id: string;
  name: string;
  nameVi: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  level: "beginner" | "intermediate" | "advanced" | string;
  parentCategory: string | null;
  wordCount: number;
  status: "active" | "inactive" | string;
  updatedAt: string;
  updatedBy: string | null;
  createdAt: string;
}
