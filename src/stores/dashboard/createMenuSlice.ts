import { StateCreator } from 'zustand';
import { DashboardStore, MenuSlice } from './types';

export const createMenuSlice: StateCreator<
  DashboardStore,
  [],
  [],
  MenuSlice
> = (set) => ({
  localCategoryOrder: [],
  setLocalCategoryOrder: (order) => set({ localCategoryOrder: order }),
  
  localMenuItemOrder: [],
  setLocalMenuItemOrder: (order) => set({ localMenuItemOrder: order }),
  
  hasUnsavedCategoryOrder: false,
  setHasUnsavedCategoryOrder: (val) => set({ hasUnsavedCategoryOrder: val }),
  
  hasUnsavedMenuItemOrder: false,
  setHasUnsavedMenuItemOrder: (val) => set({ hasUnsavedMenuItemOrder: val }),
  
  isCategorySortingMode: false,
  setIsCategorySortingMode: (val) => set({ isCategorySortingMode: val }),
  
  isMenuItemSortingMode: false,
  setIsMenuItemSortingMode: (val) => set({ isMenuItemSortingMode: val }),
  
  stagingPromoCombos: [],
  setStagingPromoCombos: (combos) => set({ stagingPromoCombos: combos }),
});
