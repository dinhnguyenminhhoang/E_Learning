"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FormModalProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  children: React.ReactNode;
  submitLabel?: string;
  submittingLabel?: string;
  cancelLabel?: string;
  showFooter?: boolean;
  className?: string;
}

export function FormModal({
  title,
  description,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  children,
  submitLabel = "Lưu",
  submittingLabel = "Đang lưu",
  cancelLabel = "Hủy",
  showFooter = true,
  className,
}: FormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-4">{children}</div>

        {showFooter && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {cancelLabel}
            </Button>
            {onSubmit && (
              <Button type="submit" onClick={onSubmit} disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
