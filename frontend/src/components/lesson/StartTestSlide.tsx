"use client";

import { Button } from "@/components/ui/button";
import { SlideContainer, TopBar } from "./Shared";

export default function StartTestSlide({ onStart }: { onStart: () => void }) {
  return (
    <SlideContainer>
      <TopBar title="Learning" />
      <div className="w-full max-w-md mt-12 text-center">
        <h3 className="text-2xl font-bold mb-3">Great job!</h3>
        <p className="text-gray-600 mb-6">
          You’ve finished learning. Ready to test your spelling?
        </p>
        <Button onClick={onStart} className="w-48">
          Start Test
        </Button>
      </div>
    </SlideContainer>
  );
}
