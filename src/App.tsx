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
import type { WorkspaceItem } from './core/GameEngine';
import Encyclopedia from './components/Encyclopedia';

function App() {
  const { state, dispatch } = useGameState();
  const [activeDragData, setActiveDragData] = useState<any>(null);
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);

  const handleAddElementFromSidebar = (elementId: string) => {
    const workspaceEl = document.getElementById('workspace-container');
    const rect = workspaceEl?.getBoundingClientRect();
    const centerX = rect ? rect.width / 2 : 200;
    const centerY = rect ? rect.height / 2 : 200;
    const jitterX = (Math.random() - 0.5) * 80;
    const jitterY = (Math.random() - 0.5) * 80;

    dispatch({
      type: 'ADD_TO_WORKSPACE',
      elementId,
      x: Math.max(40, Math.min(centerX + jitterX, (rect?.width || 400) - 40)),
      y: Math.max(40, Math.min(centerY + jitterY, (rect?.height || 400) - 40)),
    });
  };

  const handleDuplicateItem = (item: WorkspaceItem) => {
    const workspaceEl = document.getElementById('workspace-container');
    const rect = workspaceEl?.getBoundingClientRect();
    const maxX = (rect?.width || 500) - 40;
    const maxY = (rect?.height || 500) - 40;

    dispatch({
      type: 'ADD_TO_WORKSPACE',
      elementId: item.elementId,
      x: Math.min(item.x + 25, maxX),
      y: Math.min(item.y + 25, maxY),
    });
  };

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
      const width = rect?.width || 56;
      const height = rect?.height || 56;
      
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
            <Workspace
              items={state.workspace}
              activeDragData={activeDragData}
              onDuplicateItem={handleDuplicateItem}
            />
          </div>
          <Sidebar
            discovered={state.discovered}
            onAddElement={handleAddElementFromSidebar}
          />
        </div>
        
        <DragOverlay dropAnimation={null}>
          {activeDragData ? (
            <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-sm border-2 border-stone-400 shadow-2xl flex flex-col items-center justify-center p-1 scale-110 cursor-grabbing pointer-events-none">
              <span className="text-2xl leading-none mb-1">
                {gameEngine.registry.getElement(activeDragData.elementId)?.emoji}
              </span>
              <span className="text-[11px] font-medium text-stone-800 tracking-tight leading-none text-center truncate max-w-[52px]">
                {gameEngine.registry.getElement(activeDragData.elementId)?.name}
              </span>
            </div>
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
