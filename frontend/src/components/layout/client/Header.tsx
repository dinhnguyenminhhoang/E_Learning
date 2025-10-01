import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import React from "react";

const Header = () => {
  const dailyGoal = "Moderate";
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
            <Target className="w-5 h-5 text-red-500" />
            <span className="text-sm">Daily goal:</span>
            <span className="text-sm font-semibold text-yellow-600">
              {dailyGoal}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            🇬🇧 <span>English</span>
          </button>
          <Button variant="outline" size="sm">
            📱 Get The App
          </Button>
          <button className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
            👤
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
