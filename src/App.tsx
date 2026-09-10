import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
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
        distance: 3,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragData(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragData(null);
    const { active, over, delta } = event;
    
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    if (activeData.type === 'library_item') {
      const workspaceEl = document.getElementById('workspace-container');
      const workspaceRect = workspaceEl?.getBoundingClientRect();
      const rect = active.rect.current.translated;
      const width = rect?.width || 80;
      const height = rect?.height || 36;
      
      const finalX = (rect ? rect.left : 0) - (workspaceRect?.left || 0) + width / 2;
      const finalY = (rect ? rect.top : 0) - (workspaceRect?.top || 0) + height / 2;

      if (overData.type === 'workspace') {
        dispatch({
          type: 'ADD_TO_WORKSPACE',
          elementId: activeData.elementId,
          x: Math.max(30, Math.min(finalX, (workspaceRect?.width || 300) - 30)),
          y: Math.max(20, Math.min(finalY, (workspaceRect?.height || 300) - 20)),
        });
      } else if (overData.type === 'workspace_target') {
        const targetItem = state.workspace.find(i => i.instanceId === overData.instanceId);
        dispatch({
          type: 'COMBINE_WITH_NEW',
          targetInstanceId: overData.instanceId,
          newElementId: activeData.elementId,
          x: targetItem ? targetItem.x : finalX,
          y: targetItem ? targetItem.y : finalY,
        });
      }
    } else if (activeData.type === 'workspace_item') {
      if (overData.type === 'workspace_target' && overData.instanceId !== activeData.instanceId) {
        const targetItem = state.workspace.find(i => i.instanceId === overData.instanceId);
        dispatch({
          type: 'COMBINE',
          id1: activeData.instanceId,
          id2: overData.instanceId,
          x: targetItem ? targetItem.x : 100,
          y: targetItem ? targetItem.y : 100,
        });
      } else if (overData.type === 'workspace') {
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
        dispatch({
          type: 'REMOVE_FROM_WORKSPACE',
          instanceId: activeData.instanceId,
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background font-sans text-foreground select-none">
      <TopBar 
        discoveredCount={state.discovered.length} 
        totalCount={gameEngine.registry.getAllElements().length}
        onReset={() => dispatch({ type: 'CLEAR_WORKSPACE' })}
        onOpenEncyclopedia={() => setShowEncyclopedia(true)}
      />
      
      <DndContext 
        sensors={sensors} 
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="flex flex-col-reverse md:flex-row flex-1 overflow-hidden relative">
          <div id="workspace-container" className="flex-1 h-full w-full relative overflow-hidden">
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
