// "use client";

// import * as React from "react";
// import { DayPicker, CaptionProps } from "react-day-picker";
// import type { ComponentProps } from "react";
// import { cn } from "@/lib/utils";
// import { buttonVariants } from "@/components/ui/button";
// import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { vi } from "date-fns/locale";

// // Icon mũi tên
// const LeftIcon = () => <ChevronLeftIcon className="size-4" />;
// const RightIcon = () => <ChevronRightIcon className="size-4" />;

// // Custom caption dropdown tháng/năm
// function CustomCaption({
//   displayMonth,
//   onChange,
//   fromYear,
//   toYear,
// }: CaptionProps & {
//   onChange: (date: Date) => void;
//   fromYear?: number;
//   toYear?: number;
// }) {
//   const months = Array.from({ length: 12 }, (_, i) =>
//     String(i + 1).padStart(2, "0")
//   );

//   const currentYear = new Date().getFullYear();
//   const startYear = fromYear || currentYear - 10;
//   const endYear = toYear || currentYear + 10;

//   const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => {
//     return startYear + i;
//   });

//   const prevMonth = () => {
//     const newDate = new Date(displayMonth);
//     newDate.setMonth(displayMonth.getMonth() - 1);
//     onChange(newDate);
//   };

//   const nextMonth = () => {
//     const newDate = new Date(displayMonth);
//     newDate.setMonth(displayMonth.getMonth() + 1);
//     onChange(newDate);
//   };

//   return (
//     <div className="flex items-center justify-center gap-2 relative w-full">
//       {/* Nút trái */}
//       <button
//         onClick={prevMonth}
//         className="absolute left-0 p-1 rounded hover:bg-accent"
//         type="button"
//       >
//         <ChevronLeftIcon className="h-4 w-4" />
//       </button>

//       {/* Dropdown tháng */}
//       <Select
//         value={String(displayMonth.getMonth())}
//         onValueChange={(month) => {
//           const newDate = new Date(displayMonth);
//           newDate.setMonth(Number(month));
//           onChange(newDate);
//         }}
//       >
//         <SelectTrigger className="h-8 w-[70px] text-center">
//           <SelectValue placeholder="MM" />
//         </SelectTrigger>
//         <SelectContent>
//           {months.map((month, idx) => (
//             <SelectItem key={month} value={String(idx)}>
//               {month}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>

//       {/* Dropdown năm */}
//       <Select
//         value={String(displayMonth.getFullYear())}
//         onValueChange={(year) => {
//           const newDate = new Date(displayMonth);
//           newDate.setFullYear(Number(year));
//           onChange(newDate);
//         }}
//       >
//         <SelectTrigger className="h-8 w-[80px] text-center">
//           <SelectValue placeholder="YYYY" />
//         </SelectTrigger>
//         <SelectContent>
//           {years.map((year) => (
//             <SelectItem key={year} value={String(year)}>
//               {year}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>

//       {/* Nút phải */}
//       <button
//         onClick={nextMonth}
//         className="absolute right-0 p-1 rounded hover:bg-accent"
//         type="button"
//       >
//         <ChevronRightIcon className="h-4 w-4" />
//       </button>
//     </div>
//   );
// }

// type CalendarProps = ComponentProps<typeof DayPicker> & {
//   fromYear?: number;
//   toYear?: number;
// };

// function Calendar({
//   className,
//   classNames,
//   showOutsideDays = true,
//   fromYear,
//   toYear,
//   ...props
// }: CalendarProps) {
//   const [month, setMonth] = React.useState<Date>(props.month || new Date());

//   return (
//     <DayPicker
//       month={month}
//       onMonthChange={setMonth}
//       locale={vi}
//       showOutsideDays={showOutsideDays}
//       className={cn("p-3", className)}
//       classNames={{
//         months: "flex flex-col sm:flex-row gap-2",
//         month: "flex flex-col gap-4",
//         caption: "flex justify-center pt-1 relative items-center w-full",
//         caption_label: "text-sm font-medium",
//         nav: "flex items-center gap-1",
//         nav_button: cn(
//           buttonVariants({ variant: "outline" }),
//           "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
//         ),
//         nav_button_previous: "absolute left-1",
//         nav_button_next: "absolute right-1",
//         table: "w-full border-collapse space-x-1",
//         head_row: "flex",
//         head_cell:
//           "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
//         row: "flex w-full mt-2",
//         cell: cn(
//           "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
//           props.mode === "range"
//             ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
//             : "[&:has([aria-selected])]:rounded-md"
//         ),
//         day: cn(
//           buttonVariants({ variant: "ghost" }),
//           "size-8 p-0 font-normal aria-selected:opacity-100"
//         ),
//         day_range_start:
//           "day-range-start bg-black text-white aria-selected:bg-black aria-selected:text-white",
//         day_range_end:
//           "day-range-end bg-black text-white aria-selected:bg-black aria-selected:text-white",
//         day_selected:
//           "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
//         day_today: "bg-accent text-accent-foreground",
//         day_outside:
//           "day-outside text-muted-foreground aria-selected:text-muted-foreground",
//         day_disabled: "text-muted-foreground opacity-50",
//         day_range_middle:
//           "aria-selected:bg-accent aria-selected:text-accent-foreground",
//         day_hidden: "invisible",
//         ...classNames,
//       }}
//       components={{
//         IconLeft: LeftIcon,
//         IconRight: RightIcon,
//         Caption: (captionProps) => (
//           <CustomCaption
//             {...captionProps}
//             onChange={(date) => setMonth(date)}
//             fromYear={fromYear}
//             toYear={toYear}
//           />
//         ),
//       }}
//       {...props}
//     />
//   );
// }

// export { Calendar };
