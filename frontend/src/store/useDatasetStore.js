import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useDatasetStore = create(
  persist(
    (set) => ({
      currentDataset: null,
      setCurrentDataset: (dataset) => {
        console.log('Setting dataset:', dataset?.length || 0, 'rows');
        set({ currentDataset: dataset });
      },
      clearDataset: () => {
        console.log('Clearing dataset');
        set({ currentDataset: null });
      },
    }),
    {
      name: 'dataset-storage',
      getStorage: () => localStorage,
    }
  )
);

export { useDatasetStore };
