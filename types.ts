
export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  servings: number;
}

export interface GeneratedContent {
  recipe: Recipe | null;
  imageUrl: string | null;
  isEditing: boolean;
}
