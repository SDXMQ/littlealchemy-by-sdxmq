import { useReducer, useEffect } from 'react';
import { gameEngine } from '../core/GameEngine';
import type { WorkspaceItem, GameState } from '../core/GameEngine';

type Action =
  | { type: 'ADD_TO_WORKSPACE'; elementId: string; x: number; y: number }
  | { type: 'MOVE_ON_WORKSPACE'; instanceId: string; x: number; y: number }
  | { type: 'COMBINE'; id1: string; id2: string; x: number; y: number }
  | { type: 'COMBINE_WITH_NEW'; targetInstanceId: string; newElementId: string; x: number; y: number }
  | { type: 'REMOVE_FROM_WORKSPACE'; instanceId: string }
  | { type: 'CLEAR_WORKSPACE' }
  | { type: 'LOAD_SAVE'; state: GameState };

const STORAGE_KEY = 'my_laboratory_save';

const initialState: GameState = {
  discovered: gameEngine.registry.getStarterElements(),
  workspace: [],
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_TO_WORKSPACE':
      return {
        ...state,
        workspace: [
          ...state.workspace,
          {
            instanceId: `${action.elementId}-${Date.now()}-${Math.random()}`,
            elementId: action.elementId,
            x: action.x,
            y: action.y,
          },
        ],
      };
    case 'MOVE_ON_WORKSPACE':
      return {
        ...state,
        workspace: state.workspace.map(item =>
          item.instanceId === action.instanceId
            ? { ...item, x: action.x, y: action.y }
            : item
        ),
      };
    case 'COMBINE': {
      const { id1, id2, x, y } = action;
      // id1 and id2 here are instanceIds
      const item1 = state.workspace.find(i => i.instanceId === id1);
      const item2 = state.workspace.find(i => i.instanceId === id2);

      if (!item1 || !item2) return state;

      const resultElementIds = gameEngine.attemptCombination(item1.elementId, item2.elementId);
      if (!resultElementIds) {
        return state; // No combination found
      }

      const newDiscovered = new Set(state.discovered);
      resultElementIds.forEach(id => newDiscovered.add(id));

      const newWorkspaceItems = resultElementIds.map((id, index) => ({
        instanceId: `${id}-${Date.now()}-${Math.random()}-${index}`,
        elementId: id,
        x: x + index * 10,
        y: y + index * 10,
      }));

      return {
        ...state,
        discovered: Array.from(newDiscovered),
        workspace: [
          ...state.workspace.filter(i => i.instanceId !== id1 && i.instanceId !== id2),
          ...newWorkspaceItems
        ]
      };
    }
    case 'COMBINE_WITH_NEW': {
      const { targetInstanceId, newElementId, x, y } = action;
      const targetItem = state.workspace.find(i => i.instanceId === targetInstanceId);

      if (!targetItem) return state;

      const resultElementIds = gameEngine.attemptCombination(targetItem.elementId, newElementId);
      if (!resultElementIds) {
        // If combination fails, just add the new element to the workspace near it
        return {
          ...state,
          workspace: [
            ...state.workspace,
            {
              instanceId: `${newElementId}-${Date.now()}-${Math.random()}`,
              elementId: newElementId,
              x: x,
              y: y,
            },
          ],
        };
      }

      const newDiscovered = new Set(state.discovered);
      resultElementIds.forEach(id => newDiscovered.add(id));

      const newWorkspaceItems = resultElementIds.map((id, index) => ({
        instanceId: `${id}-${Date.now()}-${Math.random()}-${index}`,
        elementId: id,
        x: x + index * 10,
        y: y + index * 10,
      }));

      return {
        ...state,
        discovered: Array.from(newDiscovered),
        workspace: [
          ...state.workspace.filter(i => i.instanceId !== targetInstanceId),
          ...newWorkspaceItems
        ]
      };
    }
    case 'REMOVE_FROM_WORKSPACE':
      return {
        ...state,
        workspace: state.workspace.filter(i => i.instanceId !== action.instanceId),
      };
    case 'CLEAR_WORKSPACE':
      return {
        ...state,
        workspace: [],
      };
    case 'LOAD_SAVE':
      return action.state;
    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.discovered) {
          dispatch({ type: 'LOAD_SAVE', state: parsed });
        }
      } catch (e) {
        console.error('Failed to load save', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return { state, dispatch };
}
