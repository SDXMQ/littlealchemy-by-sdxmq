export type ElementCategory = 'basic' | 'nature' | 'material' | 'technology' | 'mythology' | 'unknown';

export class GameElement {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly emoji: string,
    public readonly category: ElementCategory
  ) {}
}
