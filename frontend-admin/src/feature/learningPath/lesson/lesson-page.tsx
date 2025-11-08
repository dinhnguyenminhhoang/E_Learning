"use client"
import { LessonListingContent } from "./lesson-listing-content";
import { createColumns } from "./table/columns";
import type { Option } from "@/types/data-table";
// src/feature/learningPath/lesson/sampleData.ts
export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  position: {
    title: string;
  };
  department: {
    name: string;
  };
  managerName: string | null;
  isProbation: boolean;
  startDate: string | null;
}

// Mock data
export const sampleEmployees: Employee[] = [
  {
    id: "1",
    employeeCode: "EMP001",
    fullName: "Nguyễn Văn A",
    position: { title: "Lập trình viên" },
    department: { name: "Phòng Công nghệ" },
    managerName: "Trần Thị B",
    isProbation: false,
    startDate: "2023-08-12",
  },
  {
    id: "2",
    employeeCode: "EMP002",
    fullName: "Trần Thị B",
    position: { title: "Trưởng nhóm" },
    department: { name: "Phòng Nhân sự" },
    managerName: "Phạm Văn C",
    isProbation: false,
    startDate: "2022-11-01",
  },
  {
    id: "3",
    employeeCode: "EMP003",
    fullName: "Phạm Văn C",
    position: { title: "Thực tập sinh" },
    department: { name: "Phòng Kinh doanh" },
    managerName: null,
    isProbation: true,
    startDate: "2024-03-10",
  },
  {
    id: "4",
    employeeCode: "EMP004",
    fullName: "Lê Thị D",
    position: { title: "Thiết kế UI/UX" },
    department: { name: "Phòng Thiết kế" },
    managerName: "Nguyễn Văn A",
    isProbation: false,
    startDate: "2021-12-15",
  },
];

export default  function LessonPage() {
  // Giả lập danh sách options cho select filter
  const positionOptions: Option[] = [
    { label: "Lập trình viên", value: "Lập trình viên" },
    { label: "Trưởng nhóm", value: "Trưởng nhóm" },
    { label: "Thực tập sinh", value: "Thực tập sinh" },
    { label: "Thiết kế UI/UX", value: "Thiết kế UI/UX" },
  ];

  const departmentOptions: Option[] = [
    { label: "Phòng Công nghệ", value: "Phòng Công nghệ" },
    { label: "Phòng Nhân sự", value: "Phòng Nhân sự" },
    { label: "Phòng Kinh doanh", value: "Phòng Kinh doanh" },
    { label: "Phòng Thiết kế", value: "Phòng Thiết kế" },
  ];

  const columns = createColumns(1, 10, positionOptions, departmentOptions);

  return (
    <LessonListingContent
      employees={sampleEmployees}
      columns={columns}
      totalEmployees={sampleEmployees.length}
    />
  );
}
