import { useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { gameEngine } from '../core/GameEngine';
import { useDraggable, useDroppable } from '@dnd-kit/core';

interface SidebarProps {
  discovered: string[];
}

export default function Sidebar({ discovered }: SidebarProps) {
  const [search, setSearch] = useState('');
  
  const { setNodeRef } = useDroppable({
    id: 'sidebar-trash',
    data: { type: 'trash' }
  });

  const elements = discovered
    .map(id => gameEngine.registry.getElement(id))
    .filter(el => el && el.name.includes(search)) as NonNullable<ReturnType<typeof gameEngine.registry.getElement>>[];

  return (
    <div ref={setNodeRef} className="w-full md:w-80 h-44 md:h-full border-t md:border-t-0 md:border-l bg-background flex flex-col shadow-sm shrink-0 z-10">
      <div className="p-2 md:p-4 border-b">
        <Input
          placeholder="원소 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card h-9"
        />
      </div>
      <ScrollArea className="flex-1 p-3 md:p-4">
        <div className="flex flex-wrap gap-3 justify-start content-start">
          {elements.map(el => (
            <DraggableLibraryItem key={el.id} element={el} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function DraggableLibraryItem({ element }: { element: any }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `lib-${element.id}`,
    data: {
      type: 'library_item',
      elementId: element.id,
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`select-none touch-none cursor-grab active:cursor-grabbing flex flex-col items-center justify-center p-0.5 ${isDragging ? 'opacity-40 scale-95' : 'hover:scale-105'} transition-all`}
    >
      <div className="w-14 h-14 rounded-full bg-white border border-stone-200/90 shadow-sm hover:shadow hover:border-stone-300 flex flex-col items-center justify-center p-1 transition-all">
        <span className="text-xl leading-none mb-0.5">{element.emoji}</span>
        <span className="text-[10px] font-medium text-stone-700 tracking-tight leading-none text-center truncate max-w-[46px]">
          {element.name}
        </span>
      </div>
    </div>
  );
}
