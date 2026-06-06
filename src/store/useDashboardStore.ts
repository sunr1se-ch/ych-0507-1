import { create } from 'zustand';
import type { FilterParams, AnalysisResult } from '../types';
import { fetchAnalysis, fetchCorridors } from '../utils/api';

interface DashboardState {
  loading: boolean;
  corridors: string[];
  filter: FilterParams;
  result: AnalysisResult | null;
  focusedSegmentId: string | null;
  setCorridors: (corridors: string[]) => void;
  setFilter: (filter: Partial<FilterParams>) => void;
  resetFilter: () => void;
  setFocusedSegment: (segmentId: string | null) => void;
  clearFocus: () => void;
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
  focusedSegmentId: null,

  setCorridors: (corridors) => set({ corridors }),

  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter },
    focusedSegmentId: null,
  })),

  resetFilter: () => set({ filter: initialFilter, focusedSegmentId: null }),

  setFocusedSegment: (segmentId) => {
    const { focusedSegmentId } = get();
    if (focusedSegmentId === segmentId) {
      set({ focusedSegmentId: null });
    } else {
      set({ focusedSegmentId: segmentId });
    }
  },

  clearFocus: () => set({ focusedSegmentId: null }),

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
    set({ loading: true, focusedSegmentId: null });
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
