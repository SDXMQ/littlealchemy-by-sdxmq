import { useDraggable, useDroppable } from '@dnd-kit/core';
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
      <div className="w-16 h-16 rounded-full bg-white border border-stone-200/90 shadow-sm hover:shadow-md hover:border-stone-300 flex flex-col items-center justify-center p-1 transition-all">
        <span className="text-2xl leading-none mb-1">{element.emoji}</span>
        <span className="text-[11px] font-medium text-stone-700 tracking-tight leading-none text-center truncate max-w-[52px]">
          {element.name}
        </span>
      </div>
    </div>
  );
}
