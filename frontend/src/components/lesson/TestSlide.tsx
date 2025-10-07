"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flag, Check, ChevronRight } from "lucide-react";
import { SlideContainer, TopBar } from "./Shared";
import { LessonWord } from "@/types/learning";

const normalize = (s: string) => s.replace(/\s+/g, "").toLowerCase();

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const letterBankFrom = (answer: string) => {
  const letters = answer
    .toLowerCase()
    .split("")
    .filter((c) => c !== " ");
  const extras = "abcdefghijklmnopqrstuvwxyz"
    .split("")
    .filter((c) => !letters.includes(c))
    .slice(0, 12 - letters.length);
  return shuffle([...letters, ...extras]).slice(
    0,
    Math.max(letters.length + 2, 10)
  );
};

export default function TestSlide({
  word,
  index,
  total,
  score,
  onResult,
  onNext,
}: {
  word: LessonWord;
  index: number;
  total: number;
  score: number;
  onResult: (ok: boolean) => void;
  onNext: () => void;
}) {
  const bank = useMemo(() => letterBankFrom(word.word), [word.word]);
  const [used, setUsed] = useState<boolean[]>(bank.map(() => false));
  const [slots, setSlots] = useState<string[]>(
    word.word.split("").map((c) => (c === " " ? " " : ""))
  );
  const [checked, setChecked] = useState<null | boolean>(null);

  const place = (ch: string, i: number) => {
    if (checked !== null) return;
    const next = slots.findIndex(
      (c, idx) => c === "" && word.word[idx] !== " "
    );
    if (next === -1) return;
    const copy = [...slots];
    copy[next] = ch;
    setSlots(copy);
    const u = [...used];
    u[i] = true;
    setUsed(u);
  };

  const handleCheck = () => {
    const ok = normalize(slots.join("")) === normalize(word.word);
    setChecked(ok);
    onResult(ok);
  };

  const canCheck =
    !slots.some((c, i) => c === "" && word.word[i] !== " ") && checked === null;

  const progress = ((index + 1) / total) * 100;

  return (
    <SlideContainer>
      <TopBar
        title="Self-testing"
        right={<Flag className="w-5 h-5 text-gray-400" />}
      />
      <div className="w-full px-6">
        <Progress value={progress} />
        <div className="flex justify-between text-sm text-gray-500 mt-1 max-w-lg mx-auto">
          <span>
            {index + 1}/{total}
          </span>
          <span>Score: {score}</span>
        </div>
      </div>

      <div className="mt-6 text-center bg-blue-50 rounded-xl p-4 w-[90%] max-w-xl mb-4">
        <p className="text-gray-700 font-medium">{word.meaning}</p>
      </div>

      <div className="flex flex-col items-center">
        <p className="text-gray-500 mb-2">{word.ipa}</p>
        <div className="flex gap-1 mb-4 flex-wrap justify-center">
          {slots.map((c, i) =>
            word.word[i] === " " ? (
              <span key={i} className="w-4" />
            ) : (
              <span
                key={i}
                className={`w-8 h-9 border-b-2 text-center text-lg font-medium ${
                  c
                    ? "text-blue-600 border-blue-400"
                    : "text-gray-300 border-gray-300"
                }`}
              >
                {c}
              </span>
            )
          )}
        </div>

        <div className="grid grid-cols-8 gap-2 mb-4">
          {bank.map((ch, i) => (
            <Button
              key={`${ch}-${i}`}
              variant={used[i] ? "secondary" : "outline"}
              disabled={used[i]}
              onClick={() => place(ch, i)}
              className="w-10 h-10 text-lg"
            >
              {ch}
            </Button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleCheck} disabled={!canCheck}>
            <Check className="w-4 h-4 mr-1" /> Check
          </Button>
          <Button
            onClick={onNext}
            variant="secondary"
            disabled={checked === null}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {checked !== null && (
          <div
            className={`mt-3 text-sm ${checked ? "text-green-600" : "text-red-600"}`}
          >
            {checked ? "✅ Correct!" : `❌ Wrong. Correct: ${word.word}`}
          </div>
        )}
      </div>
    </SlideContainer>
  );
}
