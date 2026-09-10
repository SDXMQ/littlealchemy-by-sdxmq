import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { gameEngine } from '../core/GameEngine';

interface EncyclopediaProps {
  discovered: string[];
  onClose: () => void;
}

export default function Encyclopedia({ discovered, onClose }: EncyclopediaProps) {
  const [search, setSearch] = useState('');
  const allElements = gameEngine.registry.getAllElements();
  
  const filteredElements = allElements.filter(el => el.name.includes(search));

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col bg-stone-50 border-stone-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-stone-800 flex items-center justify-between">
            <span>도감</span>
            <span className="text-sm font-normal text-stone-500 bg-stone-200/50 px-3 py-1 rounded-full">
              {discovered.length} / {allElements.length} 발견됨
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          <Input 
            placeholder="원소 검색..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border-stone-200"
          />
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pb-4">
            {filteredElements.map(el => {
              const isDiscovered = discovered.includes(el.id);
              return (
                <div 
                  key={el.id} 
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border ${
                    isDiscovered 
                      ? 'bg-white border-stone-200 shadow-sm' 
                      : 'bg-stone-100 border-dashed border-stone-300 opacity-60'
                  }`}
                >
                  <span className="text-3xl mb-2">{isDiscovered ? el.emoji : '❓'}</span>
                  <span className="text-sm font-medium text-stone-700">
                    {isDiscovered ? el.name : '미발견'}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
