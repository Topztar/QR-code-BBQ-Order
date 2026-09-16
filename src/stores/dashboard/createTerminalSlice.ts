import { StateCreator } from 'zustand';
import { DashboardStore, TerminalSlice } from './types';

export const createTerminalSlice: StateCreator<
  DashboardStore,
  [],
  [],
  TerminalSlice
> = (set) => ({
  terminalCart: [],
  setTerminalCart: (updater) => set((state) => ({ 
    terminalCart: typeof updater === 'function' ? updater(state.terminalCart) : updater 
  })),
  
  terminalTable: '',
  setTerminalTable: (table) => set({ terminalTable: table }),
  
  terminalCategory: 'all',
  setTerminalCategory: (category) => set({ terminalCategory: category }),
  
  isTerminalFullScreen: false,
  setIsTerminalFullScreen: (updater) => set((state) => ({ 
    isTerminalFullScreen: typeof updater === 'function' ? updater(state.isTerminalFullScreen) : updater 
  })),
  
  terminalPage: 1,
  setTerminalPage: (updater) => set((state) => ({ 
    terminalPage: typeof updater === 'function' ? updater(state.terminalPage) : updater 
  })),
  
  terminalCartPage: 1,
  setTerminalCartPage: (updater) => set((state) => ({ 
    terminalCartPage: typeof updater === 'function' ? updater(state.terminalCartPage) : updater 
  })),
});
