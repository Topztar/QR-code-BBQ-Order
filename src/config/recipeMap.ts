export interface RecipeIngredient {
  name: string;
  qty: string;
}

export type RecipeCompositionMap = Record<string, RecipeIngredient[]>;

/**
 * Default Recipe Composition Map for Kitchen Inventory & End-Of-Day auditing
 */
export const DEFAULT_RECIPE_COMPOSITION_MAP: RecipeCompositionMap = {
  'ty-01': [{ name: '大鮮蝦', qty: '3 只 / pcs' }, { name: '頂級椰奶罐', qty: '0.1 罐 / can' }],
  'ty-02': [{ name: '大鮮蝦', qty: '2 只 / pcs' }, { name: '頂級牛肉串面料', qty: '1 串 / skewer' }, { name: '頂級椰奶罐', qty: '0.1 罐' }],
  'nd-01': [{ name: '大鮮蝦', qty: '4 只' }, { name: '冬蔭功泡麵 / 米線', qty: '1 包 / pack' }],
  'nd-02': [{ name: '大鮮蝦', qty: '2 只' }, { name: '冬蔭功泡麵 / 米線', qty: '1 包' }],
  'cb-01': [{ name: '頂級牛肉串', qty: '1 串' }, { name: '爆香豬五花 / 金針', qty: '1 份' }, { name: '泰手標紅茶原料', qty: '0.35 升' }]
};
