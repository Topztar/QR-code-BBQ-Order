import { create } from 'zustand';
import { DashboardStore } from './types';
import { createCashierSlice } from './createCashierSlice';
import { createTerminalSlice } from './createTerminalSlice';
import { createTableSlice } from './createTableSlice';
import { createMenuSlice } from './createMenuSlice';
import { createUISlice } from './createUISlice';

export const useDashboardStore = create<DashboardStore>()((...a) => ({
  ...createCashierSlice(...a),
  ...createTerminalSlice(...a),
  ...createTableSlice(...a),
  ...createMenuSlice(...a),
  ...createUISlice(...a),
}));
