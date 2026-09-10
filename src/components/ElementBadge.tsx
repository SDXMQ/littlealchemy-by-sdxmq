import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Badge } from './ui/badge';
import { gameEngine } from '../core/GameEngine';
import type { WorkspaceItem } from '../core/GameEngine';

interface ElementBadgeProps {
  item: WorkspaceItem;
}

export default function ElementBadge({ item }: ElementBadgeProps) {
  const element = gameEngine.registry.getElement(item.elementId);

  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: `ws-drag-${item.instanceId}`,
    data: {
      type: 'workspace_item',
      instanceId: item.instanceId,
      elementId: item.elementId,
    }
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `ws-drop-${item.instanceId}`,
    data: {
      type: 'workspace_target',
      instanceId: item.instanceId,
      elementId: item.elementId,
    }
  });

  // Combine both refs
  const setBothRefs = (node: HTMLElement | null) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  if (!element) return null;

  return (
    <div
      ref={setBothRefs}
      {...listeners}
      {...attributes}
      className={`absolute select-none touch-none cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 transition-opacity ${isDragging ? 'opacity-0' : 'opacity-100'}`}
      style={{ left: item.x, top: item.y }}
    >
      <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white shadow-md rounded-full border-slate-200">
        <span className="mr-2 text-base">{element.emoji}</span>
        {element.name}
      </Badge>
    </div>
  );
}
