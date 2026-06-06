import { create } from 'zustand';
import type { FilterParams, AnalysisResult } from '../types';
import { fetchAnalysis, fetchCorridors } from '../utils/api';

interface DashboardState {
  loading: boolean;
  corridors: string[];
  filter: FilterParams;
  result: AnalysisResult | null;
  setCorridors: (corridors: string[]) => void;
  setFilter: (filter: Partial<FilterParams>) => void;
  resetFilter: () => void;
  loadCorridors: () => Promise<void>;
  loadAnalysis: () => Promise<void>;
}

const initialFilter: FilterParams = {
  corridors: [],
  startDate: '',
  endDate: '',
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  loading: false,
  corridors: [],
  filter: initialFilter,
  result: null,

  setCorridors: (corridors) => set({ corridors }),

  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter },
  })),

  resetFilter: () => set({ filter: initialFilter }),

  loadCorridors: async () => {
    try {
      const data = await fetchCorridors();
      set({ corridors: data });
    } catch (e) {
      console.error('Failed to load corridors:', e);
    }
  },

  loadAnalysis: async () => {
    const { filter } = get();
    set({ loading: true });
    try {
      const data = await fetchAnalysis(filter);
      set({ result: data });
    } catch (e) {
      console.error('Failed to load analysis:', e);
    } finally {
      set({ loading: false });
    }
  },
}));
