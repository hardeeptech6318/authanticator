import { create } from 'zustand'

export const useBearStore = create((set) => ({
  bears: undefined,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))