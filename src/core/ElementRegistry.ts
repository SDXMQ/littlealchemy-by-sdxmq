import { GameElement } from './models/Element';
import { elementsData } from '../data/elementsData';

export class ElementRegistry {
  private elements = new Map<string, GameElement>();

  constructor() {
    this.loadElements();
  }

  private loadElements() {
    for (const [id, data] of Object.entries(elementsData)) {
      this.elements.set(id, new GameElement(id, data.name, data.emoji, data.category as any, data.description));
    }
  }

  public getElement(id: string): GameElement | undefined {
    return this.elements.get(id);
  }

  public getAllElements(): GameElement[] {
    return Array.from(this.elements.values());
  }

  public getStarterElements(): string[] {
    return ['water', 'fire', 'earth', 'air'];
  }
}
