import { useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
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
    <div ref={setNodeRef} className="w-80 h-full border-l bg-background flex flex-col shadow-sm">
      <div className="p-4 border-b">
        <Input
          placeholder="원소 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card"
        />
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-wrap gap-2">
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
      className={`select-none touch-none cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
    >
      <Badge variant="secondary" className="px-3 py-1.5 text-sm bg-white border shadow-sm hover:bg-slate-50 transition-colors">
        <span className="mr-2 text-base">{element.emoji}</span>
        {element.name}
      </Badge>
    </div>
  );
}
