import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { gameEngine } from '../core/GameEngine';

interface EncyclopediaProps {
  discovered: string[];
  onClose: () => void;
}

export default function Encyclopedia({ discovered, onClose }: EncyclopediaProps) {
  const [search, setSearch] = useState('');
  
  const allElements = useMemo(() => gameEngine.registry.getAllElements(), []);
  
  const filteredElements = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allElements;
    return allElements.filter(el => el.name.toLowerCase().includes(query));
  }, [allElements, search]);

  const discoveredSet = useMemo(() => new Set(discovered), [discovered]);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col bg-stone-50 border-stone-200">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-stone-800 flex items-center justify-between">
            <span>도감</span>
            <span className="text-xs sm:text-sm font-normal text-stone-500 bg-stone-200/50 px-3 py-1 rounded-full">
              {discovered.length} / {allElements.length} 발견됨
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-2 shrink-0">
          <Input 
            placeholder="원소 검색..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border-stone-200 h-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-1 overscroll-contain">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pb-4">
            {filteredElements.map(el => {
              const isDiscovered = discoveredSet.has(el.id);
              return (
                <div 
                  key={el.id} 
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${
                    isDiscovered 
                      ? 'bg-white border-stone-200/90 shadow-xs' 
                      : 'bg-stone-100/60 border-dashed border-stone-300 opacity-60'
                  }`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-1.5 ${
                    isDiscovered ? 'bg-stone-50 border border-stone-100' : 'bg-stone-200/50'
                  }`}>
                    <span className="text-xl sm:text-2xl">{isDiscovered ? el.emoji : '❓'}</span>
                  </div>
                  <span className="text-xs font-medium text-stone-700 tracking-tight truncate max-w-[80px]">
                    {isDiscovered ? el.name : '미발견'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
