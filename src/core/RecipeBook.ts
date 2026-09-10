import { recipesData } from '../data/recipesData';

export class RecipeBook {
  private recipes = new Map<string, string[]>();

  constructor() {
    this.loadRecipes();
  }

  private loadRecipes() {
    for (const [key, result] of Object.entries(recipesData)) {
      this.recipes.set(key, result);
    }
  }

  public getCombinationKey(id1: string, id2: string): string {
    return [id1, id2].sort().join('+');
  }

  public combine(id1: string, id2: string): string[] | null {
    const key = this.getCombinationKey(id1, id2);
    return this.recipes.get(key) || null;
  }
}
