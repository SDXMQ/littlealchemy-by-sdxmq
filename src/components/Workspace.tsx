import { useDroppable } from '@dnd-kit/core';
import type { WorkspaceItem } from '../core/GameEngine';
import ElementBadge from './ElementBadge';

interface WorkspaceProps {
  items: WorkspaceItem[];
  activeDragData: { elementId: string; instanceId?: string } | null;
  onDuplicateItem: (item: WorkspaceItem) => void;
}

export default function Workspace({ items, activeDragData, onDuplicateItem }: WorkspaceProps) {
  const { setNodeRef } = useDroppable({
    id: 'workspace-droppable',
    data: { type: 'workspace' }
  });

  return (
    <div ref={setNodeRef} className="w-full h-full relative overflow-hidden bg-background/50 select-none">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />
      {items.map(item => (
        <ElementBadge
          key={item.instanceId}
          item={item}
          activeDragData={activeDragData}
          onDoubleClick={() => onDuplicateItem(item)}
        />
      ))}
    </div>
  );
}
