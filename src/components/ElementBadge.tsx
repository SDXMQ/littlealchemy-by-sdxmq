import { useDraggable, useDroppable } from '@dnd-kit/core';
import { gameEngine } from '../core/GameEngine';
import type { WorkspaceItem } from '../core/GameEngine';

interface ElementBadgeProps {
  item: WorkspaceItem;
  activeDragData: { elementId: string; instanceId?: string } | null;
  onDoubleClick: () => void;
}

export default function ElementBadge({ item, activeDragData, onDoubleClick }: ElementBadgeProps) {
  const element = gameEngine.registry.getElement(item.elementId);

  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: `ws-drag-${item.instanceId}`,
    data: {
      type: 'workspace_item',
      instanceId: item.instanceId,
      elementId: item.elementId,
    }
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
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

  const isCombinable = Boolean(
    isOver &&
    activeDragData &&
    activeDragData.instanceId !== item.instanceId &&
    gameEngine.attemptCombination(activeDragData.elementId, item.elementId)
  );

  return (
    <div
      ref={setBothRefs}
      {...listeners}
      {...attributes}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      title="더블클릭하여 복제"
      className={`absolute select-none touch-none cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 transition-opacity ${isDragging ? 'opacity-0' : 'opacity-100'}`}
      style={{ left: item.x, top: item.y }}
    >
      <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center p-1 relative transition-all ${
        isCombinable
          ? 'bg-emerald-50/90 border-2 border-emerald-500 ring-4 ring-emerald-300/80 shadow-lg shadow-emerald-200 scale-110'
          : isOver
          ? 'bg-white border border-stone-300 ring-2 ring-stone-200 scale-105'
          : 'bg-white border border-stone-200/90 shadow-sm hover:shadow-md hover:border-stone-300'
      }`}>
        <span className="text-2xl leading-none mb-1">{element.emoji}</span>
        <span className="text-[11px] font-medium text-stone-700 tracking-tight leading-none text-center truncate max-w-[52px]">
          {element.name}
        </span>
        {isCombinable && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-bounce">
            ✨
          </span>
        )}
      </div>
    </div>
  );
}
