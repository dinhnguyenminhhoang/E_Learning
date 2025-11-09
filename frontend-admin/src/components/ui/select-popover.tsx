"use client";

import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface SelectPopoverProps<T extends { id: string; name?: string; title?: string }> {
  control: any; 
  name: string;
  label: string;
  options: T[];
  placeholder?: string;
  multiple?: boolean;
  required?: boolean;
}

export function SelectPopover<T extends { id: string; name?: string; title?: string }>({
  control,
  name,
  label,
  options,
  placeholder,
  multiple = false,
  required = false,
}: SelectPopoverProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}
              >
                {multiple
                  ? field.value?.length
                    ? `${field.value.length} mục đã chọn`
                    : placeholder || "Chọn giá trị"
                  : options.find((o) => o.id === field.value)?.name ||
                    options.find((o) => o.id === field.value)?.title ||
                    placeholder ||
                    "Chọn giá trị"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder={`Tìm ${label.toLowerCase()}...`} />
                <CommandList>
                  <CommandEmpty>Không tìm thấy {label.toLowerCase()}</CommandEmpty>
                  <CommandGroup>
                    {options.map((item) => {
                      const displayName = item.name || item.title || item.id;
                      const selected = multiple ? (field.value ?? []).includes(item.id) : field.value === item.id;

                      return (
                        <CommandItem
                          key={item.id}
                          onSelect={() => {
                            if (multiple) {
                              let newValue = field.value ?? [];
                              if (selected) newValue = newValue.filter((v: string) => v !== item.id);
                              else newValue = [...newValue, item.id];
                              field.onChange(newValue);
                            } else {
                              field.onChange(item.id);
                            }
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                          {displayName}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Hiển thị badge nếu là multiple */}
          {multiple && (field.value?.length ?? 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {field.value?.map((id: string) => {
                const item = options.find((o) => o.id === id);
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => field.onChange(field.value?.filter((v: string) => v !== id))}
                  >
                    {item?.name || item?.title || id} ✕
                  </Badge>
                );
              })}
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
