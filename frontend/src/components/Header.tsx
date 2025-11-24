import { Trophy, User, ChevronLeft } from 'lucide-react';
import type { ViewType } from '@/types';

interface HeaderProps {
  view: ViewType;
  onBackClick: () => void;
}

export default function Header({ view, onBackClick }: HeaderProps) {
  return (
    <header className="flex justify-between items-center px-8 py-6 sticky top-0 bg-white/80 backdrop-blur-2xl z-50 shadow-sm">
      <div className="flex items-center gap-4">
        {view !== 'hub' && (
          <button
            onClick={onBackClick}
            className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md"
            aria-label="Back to Hub"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-white flex items-center justify-center shadow-lg shadow-red-200/50">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Score</h1>
            <p className="text-xs text-gray-500 font-medium">AI Predictions</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-gradient-to-r from-red-50 to-white rounded-full border border-red-100">
          <span className="text-xs font-semibold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
            AI Powered
          </span>
        </div>
        <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 flex items-center justify-center shadow-sm">
          <User className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
