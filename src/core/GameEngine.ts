import { ElementRegistry } from './ElementRegistry';
import { RecipeBook } from './RecipeBook';

export interface WorkspaceItem {
  instanceId: string;
  elementId: string;
  x: number;
  y: number;
}

export interface GameState {
  discovered: string[];
  workspace: WorkspaceItem[];
}

export class GameEngine {
  public registry: ElementRegistry;
  public recipeBook: RecipeBook;

  constructor() {
    this.registry = new ElementRegistry();
    this.recipeBook = new RecipeBook();
  }

  public attemptCombination(id1: string, id2: string): string[] | null {
    return this.recipeBook.combine(id1, id2);
  }

  public isStarterElement(id: string): boolean {
    return this.registry.getStarterElements().includes(id);
  }
}

export const gameEngine = new GameEngine();
