import { Language } from './types';
import { INITIAL_TRANSLATIONS, INITIAL_CAT_NAMES } from './constants/translations';

// Pre-populated synchronous master translations & category names store
export let TRANSLATIONS: { [key: string]: { [lang in Language]?: string } } = { ...INITIAL_TRANSLATIONS };
export let CAT_NAMES: { [key: string]: { [lang in Language]?: string } } = { ...INITIAL_CAT_NAMES };
export let INITIAL_CATEGORIES: any[] = [];
export let INITIAL_MENU: any[] = [];
export let INITIAL_INGREDIENTS: any[] = [];
export let INGREDIENT_RECIPE_MAP: { [foodId: string]: { ingredientId: string; amount: number }[] } = {};

export async function loadData() {
  try {
    const response = await fetch('/data.json');
    if (!response.ok) return;
    const data = await response.json();
    if (data.TRANSLATIONS) {
      Object.assign(TRANSLATIONS, data.TRANSLATIONS);
    }
    if (data.CAT_NAMES) {
      Object.assign(CAT_NAMES, data.CAT_NAMES);
    }
    if (data.INITIAL_CATEGORIES) INITIAL_CATEGORIES = data.INITIAL_CATEGORIES;
    if (data.INITIAL_MENU) INITIAL_MENU = data.INITIAL_MENU;
    if (data.INITIAL_INGREDIENTS) INITIAL_INGREDIENTS = data.INITIAL_INGREDIENTS;
    if (data.INGREDIENT_RECIPE_MAP) INGREDIENT_RECIPE_MAP = data.INGREDIENT_RECIPE_MAP;
  } catch (err) {
    console.warn('loadData fallback to synchronous store:', err);
  }
}
