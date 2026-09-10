import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useGameState } from './hooks/useGameState';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';
import TopBar from './components/TopBar';
import { gameEngine } from './core/GameEngine';
import { Badge } from './components/ui/badge';
import Encyclopedia from './components/Encyclopedia';

function App() {
  const { state, dispatch } = useGameState();
  const [activeDragData, setActiveDragData] = useState<any>(null);
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2, // 2px movement required before drag starts
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragData(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragData(null);
    const { active, over, delta } = event;
    
    if (!over) return; // Dropped outside anywhere

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    if (activeData.type === 'library_item') {
      // Dragging from library to workspace or onto an item
      const workspaceRect = document.getElementById('workspace-container')?.getBoundingClientRect();
      const finalX = (active.rect.current.translated?.left || 0) - (workspaceRect?.left || 0) + 40;
      const finalY = (active.rect.current.translated?.top || 0) - (workspaceRect?.top || 0) + 20;

      if (overData.type === 'workspace') {
        dispatch({
          type: 'ADD_TO_WORKSPACE',
          elementId: activeData.elementId,
          x: finalX,
          y: finalY,
        });
      } else if (overData.type === 'workspace_target') {
        dispatch({
          type: 'COMBINE_WITH_NEW',
          targetInstanceId: overData.instanceId,
          newElementId: activeData.elementId,
          x: finalX,
          y: finalY,
        });
      }
    } else if (activeData.type === 'workspace_item') {
      // Dragging inside workspace
      if (overData.type === 'workspace_target' && overData.instanceId !== activeData.instanceId) {
        // Drop on another item -> Combine
        dispatch({
          type: 'COMBINE',
          id1: activeData.instanceId,
          id2: overData.instanceId,
          x: over.rect.left - (document.getElementById('workspace-container')?.getBoundingClientRect().left || 0) + 40,
          y: over.rect.top - (document.getElementById('workspace-container')?.getBoundingClientRect().top || 0) + 20,
        });
      } else if (overData.type === 'workspace') {
        // Drop on empty workspace -> Move
        const item = state.workspace.find(i => i.instanceId === activeData.instanceId);
        if (item) {
          dispatch({
            type: 'MOVE_ON_WORKSPACE',
            instanceId: activeData.instanceId,
            x: item.x + delta.x,
            y: item.y + delta.y,
          });
        }
      } else if (overData.type === 'trash') {
        // Remove from workspace
        dispatch({
          type: 'REMOVE_FROM_WORKSPACE',
          instanceId: activeData.instanceId,
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background font-sans text-foreground">
      <TopBar 
        discoveredCount={state.discovered.length} 
        totalCount={gameEngine.registry.getAllElements().length}
        onReset={() => dispatch({ type: 'CLEAR_WORKSPACE' })}
        onOpenEncyclopedia={() => setShowEncyclopedia(true)}
      />
      
      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="flex flex-1 overflow-hidden relative">
          <div id="workspace-container" className="flex-1 relative">
            <Workspace items={state.workspace} />
          </div>
          <Sidebar discovered={state.discovered} />
        </div>
        
        <DragOverlay dropAnimation={null}>
          {activeDragData ? (
            <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white shadow-xl rounded-full border-slate-300 scale-110 cursor-grabbing">
              <span className="mr-2 text-base">{gameEngine.registry.getElement(activeDragData.elementId)?.emoji}</span>
              {gameEngine.registry.getElement(activeDragData.elementId)?.name}
            </Badge>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showEncyclopedia && (
        <Encyclopedia 
          discovered={state.discovered} 
          onClose={() => setShowEncyclopedia(false)} 
        />
      )}
    </div>
  );
}

export default App;
