import { BookOpen, GraduationCap, Home, Settings } from "lucide-react";
import React from "react";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-500">GuruLango</h1>
      </div>

      <nav className="flex-1 px-4">
        <div className="mb-6">
          <div className="text-xs font-semibold text-gray-400 uppercase mb-2 px-3">
            Learning
          </div>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-600 font-medium">
              <Home className="w-5 h-5" />
              Home
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50">
              <GraduationCap className="w-5 h-5" />
              Learning
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50">
              <BookOpen className="w-5 h-5" />
              Word list
            </button>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase mb-2 px-3">
            Account
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
            MH
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">Minh Hoàng</div>
            <div className="text-xs text-gray-500 truncate">
              dinh*****@gmail.com
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
