export const formatNumber = (num: number, decimals = 3): string => {
  return num.toFixed(decimals);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '不限';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

export const getIntensityColor = (intensity: number, max: number): string => {
  if (intensity <= 0) return 'rgb(75, 85, 99)';
  const ratio = Math.min(1, intensity / max);
  const r = Math.round(14 + ratio * 239);
  const g = Math.round(165 - ratio * 90);
  const b = Math.round(233 - ratio * 100);
  return `rgb(${r}, ${g}, ${b})`;
};

export const getIntensityLevel = (intensity: number, max: number): string => {
  if (intensity <= 0) return '正常';
  const ratio = intensity / max;
  if (ratio < 0.3) return '轻微';
  if (ratio < 0.6) return '中等';
  if (ratio < 0.9) return '严重';
  return '高危';
};
