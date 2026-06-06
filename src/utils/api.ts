import type { FilterParams, AnalysisResult } from '../types';

const API_BASE = '/api/dashboard';

export const fetchCorridors = async (): Promise<string[]> => {
  const res = await fetch(`${API_BASE}/corridors`);
  return res.json();
};

export const fetchAnalysis = async (filter: FilterParams): Promise<AnalysisResult> => {
  const res = await fetch(`${API_BASE}/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filter }),
  });
  return res.json();
};

export const exportAnalysis = async (filter: FilterParams): Promise<void> => {
  const params = new URLSearchParams({
    corridors: filter.corridors.join(','),
    startDate: filter.startDate,
    endDate: filter.endDate,
  });
  const url = `${API_BASE}/export?${params.toString()}`;
  window.open(url, '_blank');
};

export const importSamples = async (file: File): Promise<{ success: boolean; count: number; error?: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
};

export const downloadTemplate = async (): Promise<void> => {
  window.open(`${API_BASE}/sample-template`, '_blank');
};

export const resetData = async (): Promise<void> => {
  await fetch(`${API_BASE}/reset`, { method: 'POST' });
};
