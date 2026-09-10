import { Button } from './ui/button';
import { RotateCcw, BookOpen, Settings } from 'lucide-react';
import { GAME_CONFIG } from '../config';

interface TopBarProps {
  discoveredCount: number;
  totalCount: number;
  onReset: () => void;
  onOpenEncyclopedia: () => void;
}

export default function TopBar({ discoveredCount, totalCount, onReset, onOpenEncyclopedia }: TopBarProps) {
  return (
    <div className="h-14 border-b bg-white flex items-center justify-between px-3 md:px-6 shadow-sm z-10 relative shrink-0">
      <div className="flex items-center gap-2 sm:gap-4">
        <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-800 truncate">{GAME_CONFIG.title}</h1>
        <span className="text-xs sm:text-sm text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md shrink-0">
          발견: {discoveredCount} / {totalCount}
        </span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-600 px-2 sm:px-3">
          <RotateCcw className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">초기화</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenEncyclopedia} className="text-slate-600 px-2 sm:px-3">
          <BookOpen className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">도감</span>
        </Button>
      </div>
    </div>
  );
}
