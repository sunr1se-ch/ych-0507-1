export interface PipeSegment {
  segmentId: string;
  corridor: string;
  length: number;
  upstreamNode: string;
}

export interface LeakSample {
  segmentId: string;
  sampleTime: string;
  conductivity: number;
  flow: number;
}

export interface SegmentLeakage {
  segmentId: string;
  corridor: string;
  upstreamNode: string;
  length: number;
  avgLeakageIntensity: number;
  sampleCount: number;
  adjacentSegments: string[];
  neighborAvgIntensity: number;
}

export interface FilterParams {
  corridors: string[];
  startDate: string;
  endDate: string;
}

export interface Summary {
  totalSegments: number;
  abnormalSegments: number;
  avgIntensity: number;
  maxIntensitySegment: string;
  maxIntensity: number;
}

export interface AnalysisResult {
  segments: SegmentLeakage[];
  summary: Summary;
}
