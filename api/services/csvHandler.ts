import type { LeakSample, SegmentLeakage, FilterParams } from '../../shared/types.js';

export const parseSamplesCsv = (csvContent: string): LeakSample[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
  
  const segIdx = headers.findIndex(h => h.includes('段号') || h.includes('segment') || h.includes('id'));
  const timeIdx = headers.findIndex(h => h.includes('时间') || h.includes('time') || h.includes('date'));
  const condIdx = headers.findIndex(h => h.includes('导率') || h.includes('conductivity') || h.includes('cond'));
  const flowIdx = headers.findIndex(h => h.includes('流量') || h.includes('flow'));

  if (segIdx === -1 || timeIdx === -1 || condIdx === -1 || flowIdx === -1) {
    throw new Error('CSV格式错误，缺少必要的列：段号、采样时间、水导率、流量');
  }

  const samples: LeakSample[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length < Math.max(segIdx, timeIdx, condIdx, flowIdx) + 1) continue;

    const sample: LeakSample = {
      segmentId: cols[segIdx],
      sampleTime: cols[timeIdx],
      conductivity: parseFloat(cols[condIdx]),
      flow: parseFloat(cols[flowIdx]),
    };

    if (sample.segmentId && 
        !isNaN(sample.conductivity) && 
        !isNaN(sample.flow) &&
        !isNaN(new Date(sample.sampleTime).getTime())) {
      samples.push(sample);
    }
  }

  return samples;
};

export const generateAnalysisCsv = (
  segments: SegmentLeakage[],
  filter: FilterParams
): string => {
  const header = [
    '段号',
    '廊道',
    '上游节点',
    '长度(米)',
    '平均渗漏强度',
    '采样次数',
    '相邻段号',
    '邻段平均强度',
    '强度对比(本段-邻段)',
  ].join(',');

  const rows = segments.map(seg => {
    const contrast = seg.neighborAvgIntensity - seg.avgLeakageIntensity;
    return [
      seg.segmentId,
      seg.corridor,
      seg.upstreamNode,
      seg.length,
      seg.avgLeakageIntensity.toFixed(3),
      seg.sampleCount,
      seg.adjacentSegments.join(';'),
      seg.neighborAvgIntensity.toFixed(3),
      contrast.toFixed(3),
    ].join(',');
  });

  const metadata = [
    '# 地下管廊渗漏分析结果导出',
    `# 导出时间: ${new Date().toISOString().slice(0, 10)}`,
    `# 筛选廊道: ${filter.corridors.length > 0 ? filter.corridors.join(';') : '全部'}`,
    `# 日期范围: ${filter.startDate || '不限'} 至 ${filter.endDate || '不限'}`,
  ].join('\n');

  return `${metadata}\n${header}\n${rows.join('\n')}`;
};

export const generateSamplesCsv = (): string => {
  const header = ['段号', '采样时间', '水导率', '流量'].join(',');
  const seedData = [
    'GL-A-001,2025-03-01,175,60',
    'GL-A-001,2025-03-11,190,68',
    'GL-A-002,2025-03-01,135,45',
    'GL-A-002,2025-03-11,148,52',
  ].join('\n');
  return `# 采样数据导入CSV格式示例\n# 列顺序：段号,采样时间,水导率,流量\n${header}\n${seedData}\n`;
};
