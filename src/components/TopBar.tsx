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
    <div className="h-14 border-b bg-white flex items-center justify-between px-6 shadow-sm z-10 relative">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight text-slate-800">{GAME_CONFIG.title}</h1>
        <span className="text-sm text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
          발견: {discoveredCount} / {totalCount}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-600">
          <RotateCcw className="w-4 h-4 mr-2" />
          초기화
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenEncyclopedia} className="text-slate-600">
          <BookOpen className="w-4 h-4 mr-2" />
          도감
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-600">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
