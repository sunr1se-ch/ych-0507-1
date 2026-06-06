import type { PipeSegment, LeakSample, SegmentLeakage } from '../../shared/types.js';

const diffDays = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const calculateLeakageIntensity = (
  samples: LeakSample[],
  segments: PipeSegment[]
): Map<string, number> => {
  const result = new Map<string, number>();
  
  const samplesBySegment = new Map<string, LeakSample[]>();
  for (const s of samples) {
    if (!samplesBySegment.has(s.segmentId)) {
      samplesBySegment.set(s.segmentId, []);
    }
    samplesBySegment.get(s.segmentId)!.push(s);
  }

  for (const [segmentId, segSamples] of samplesBySegment) {
    const sorted = [...segSamples].sort((a, b) => 
      new Date(a.sampleTime).getTime() - new Date(b.sampleTime).getTime()
    );
    
    if (sorted.length < 2) {
      result.set(segmentId, 0);
      continue;
    }

    let totalIntensity = 0;
    let validPairs = 0;

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      
      if (next.conductivity > current.conductivity && next.flow > current.flow) {
        const condDelta = next.conductivity - current.conductivity;
        const days = diffDays(current.sampleTime, next.sampleTime);
        totalIntensity += condDelta / days;
        validPairs++;
      }
    }

    const avgIntensity = validPairs > 0 ? totalIntensity / validPairs : 0;
    result.set(segmentId, avgIntensity);
  }

  for (const seg of segments) {
    if (!result.has(seg.segmentId)) {
      result.set(seg.segmentId, 0);
    }
  }

  return result;
};

export const calculateAdjacentSegments = (
  segments: PipeSegment[]
): Map<string, string[]> => {
  const result = new Map<string, string[]>();
  const segmentsByCorridor = new Map<string, PipeSegment[]>();

  for (const seg of segments) {
    if (!segmentsByCorridor.has(seg.corridor)) {
      segmentsByCorridor.set(seg.corridor, []);
    }
    segmentsByCorridor.get(seg.corridor)!.push(seg);
  }

  for (const [, corridorSegments] of segmentsByCorridor) {
    const sorted = [...corridorSegments].sort((a, b) => a.length - b.length);

    for (let i = 0; i < sorted.length; i++) {
      const adj: string[] = [];
      if (i > 0) adj.push(sorted[i - 1].segmentId);
      if (i < sorted.length - 1) adj.push(sorted[i + 1].segmentId);
      result.set(sorted[i].segmentId, adj);
    }
  }

  return result;
};

export const calculateNeighborAvgIntensity = (
  segmentId: string,
  adjacentSegments: string[],
  intensityMap: Map<string, number>
): number => {
  if (adjacentSegments.length === 0) return 0;
  
  let total = 0;
  let count = 0;
  for (const adjId of adjacentSegments) {
    const intensity = intensityMap.get(adjId) ?? 0;
    total += intensity;
    count++;
  }
  
  return count > 0 ? total / count : 0;
};

export const analyzeSegments = (
  segments: PipeSegment[],
  samples: LeakSample[],
  baselineSamples?: LeakSample[]
): SegmentLeakage[] => {
  const intensityMap = calculateLeakageIntensity(samples, segments);
  const neighborIntensityMap = calculateLeakageIntensity(
    baselineSamples ?? samples,
    segments
  );
  const adjMap = calculateAdjacentSegments(segments);

  return segments.map(seg => {
    const intensity = intensityMap.get(seg.segmentId) ?? 0;
    const adjacent = adjMap.get(seg.segmentId) ?? [];
    const neighborAvg = calculateNeighborAvgIntensity(
      seg.segmentId,
      adjacent,
      neighborIntensityMap
    );

    const segSamples = samples.filter(s => s.segmentId === seg.segmentId);

    return {
      segmentId: seg.segmentId,
      corridor: seg.corridor,
      upstreamNode: seg.upstreamNode,
      length: seg.length,
      avgLeakageIntensity: Math.round(intensity * 1000) / 1000,
      sampleCount: segSamples.length,
      adjacentSegments: adjacent,
      neighborAvgIntensity: Math.round(neighborAvg * 1000) / 1000,
    };
  });
};
