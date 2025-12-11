import { useEffect, useRef, useCallback } from "react";
import { Answer } from "@/types/examAttempt.types";

interface AutoSaveOptions {
  attemptId: string;
  debounceMs?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

interface StoredData {
  answers: Record<string, Answer>;
  timestamp: number;
  version: string;
}

const STORAGE_VERSION = "1.0.0";
const DEFAULT_DEBOUNCE_MS = 500; // Save sau 500ms không có thay đổi

/**
 * Custom hook để tự động lưu answers vào localStorage
 * Sử dụng debounce để tránh save quá nhiều lần
 */
export function useExamAutoSave(
  answers: Map<string, Answer>,
  options: AutoSaveOptions
) {
  const { attemptId, debounceMs = DEFAULT_DEBOUNCE_MS, onSaveSuccess, onSaveError } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");
  const isMountedRef = useRef(true);

  // Get storage key
  const getStorageKey = useCallback((id: string) => `exam_answers_${id}`, []);

  // Save to localStorage với error handling
  const saveToStorage = useCallback(
    (data: Map<string, Answer>) => {
      if (typeof window === "undefined" || !attemptId) return;

      try {
        const answersObj = Object.fromEntries(data);
        const storedData: StoredData = {
          answers: answersObj,
          timestamp: Date.now(),
          version: STORAGE_VERSION,
        };

        const serialized = JSON.stringify(storedData);
        
        // Chỉ save nếu data thay đổi
        if (serialized !== lastSavedRef.current) {
          localStorage.setItem(getStorageKey(attemptId), serialized);
          lastSavedRef.current = serialized;
          onSaveSuccess?.();
        }
      } catch (error) {
        console.error("Error saving answers to localStorage:", error);
        
        // Handle quota exceeded error
        if (error instanceof Error && error.name === "QuotaExceededError") {
          console.warn("LocalStorage quota exceeded. Clearing old data...");
          try {
            // Clear old exam data (keep only current attempt)
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
              if (key.startsWith("exam_answers_") && key !== getStorageKey(attemptId)) {
                localStorage.removeItem(key);
              }
            });
            // Retry save
            const answersObj = Object.fromEntries(data);
            const storedData: StoredData = {
              answers: answersObj,
              timestamp: Date.now(),
              version: STORAGE_VERSION,
            };
            localStorage.setItem(getStorageKey(attemptId), JSON.stringify(storedData));
            lastSavedRef.current = JSON.stringify(storedData);
            onSaveSuccess?.();
          } catch (retryError) {
            onSaveError?.(retryError as Error);
          }
        } else {
          onSaveError?.(error as Error);
        }
      }
    },
    [attemptId, getStorageKey, onSaveSuccess, onSaveError]
  );

  // Debounced save function
  const debouncedSave = useCallback(
    (data: Map<string, Answer>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          saveToStorage(data);
        }
      }, debounceMs);
    },
    [saveToStorage, debounceMs]
  );

  // Auto-save khi answers thay đổi
  useEffect(() => {
    if (!attemptId || answers.size === 0) return;

    debouncedSave(answers);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [answers, attemptId, debouncedSave]);

  // Force save (không debounce) - dùng khi cần save ngay lập tức
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveToStorage(answers);
  }, [answers, saveToStorage]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Save cuối cùng trước khi unmount
      if (answers.size > 0) {
        saveToStorage(answers);
      }
    };
  }, []);

  return { forceSave };
}

/**
 * Load answers từ localStorage
 */
export function loadAnswersFromStorage(attemptId: string): Map<string, Answer> {
  if (typeof window === "undefined" || !attemptId) return new Map();

  try {
    const stored = localStorage.getItem(`exam_answers_${attemptId}`);
    if (!stored) return new Map();

    const parsed = JSON.parse(stored) as StoredData;
    
    // Validate version
    if (parsed.version !== STORAGE_VERSION) {
      console.warn("Storage version mismatch. Migrating data...");
      // Có thể thêm migration logic ở đây nếu cần
    }

    // Convert object to Map
    return new Map(Object.entries(parsed.answers || {}));
  } catch (error) {
    console.error("Error loading answers from storage:", error);
    return new Map();
  }
}

/**
 * Clear answers từ localStorage
 */
export function clearAnswersFromStorage(attemptId: string): void {
  if (typeof window === "undefined" || !attemptId) return;

  try {
    localStorage.removeItem(`exam_answers_${attemptId}`);
  } catch (error) {
    console.error("Error clearing answers from storage:", error);
  }
}

/**
 * Get last save timestamp
 */
export function getLastSaveTimestamp(attemptId: string): number | null {
  if (typeof window === "undefined" || !attemptId) return null;

  try {
    const stored = localStorage.getItem(`exam_answers_${attemptId}`);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as StoredData;
    return parsed.timestamp || null;
  } catch (error) {
    console.error("Error getting last save timestamp:", error);
    return null;
  }
}

