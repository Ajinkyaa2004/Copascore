import { Home, BarChart3, User } from 'lucide-react';
import type { ViewType } from '@/types';

interface BottomNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  const navItems = [
    { id: 'hub' as ViewType, label: 'Home', icon: Home },
    { id: 'predictions' as ViewType, label: 'Predict', icon: BarChart3 },
    { id: 'chat' as ViewType, label: 'Assistant', icon: null },
    { id: 'players' as ViewType, label: 'Players', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-2xl border-t border-gray-200 flex justify-around py-5 pb-7 z-50 shadow-lg">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${currentView === item.id ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'
            }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${currentView === item.id
                ? item.id === 'chat'
                  ? 'bg-gradient-to-br from-red-500 to-white shadow-lg shadow-red-200'
                  : 'bg-red-100'
                : item.id === 'chat'
                  ? 'bg-gradient-to-br from-red-400 to-red-300'
                  : 'bg-transparent'
              }`}
          >
            {item.id === 'chat' ? (
              <span className="text-sm font-bold text-white">AI</span>
            ) : item.icon ? (
              <item.icon className="w-6 h-6" />
            ) : null}
          </div>
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
