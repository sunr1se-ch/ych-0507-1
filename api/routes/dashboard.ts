import { Router } from 'express';
import multer from 'multer';
import type { Request, Response } from 'express';
import { 
  getSegments, 
  getSamples, 
  getCorridors, 
  addSamples, 
  filterSamplesByDate, 
  filterSegmentsByCorridor,
  initDataStore,
  resetToSeed,
} from '../services/dataManager.js';
import { analyzeSegments } from '../services/calculation.js';
import { parseSamplesCsv, generateAnalysisCsv, generateSamplesCsv } from '../services/csvHandler.js';
import type { FilterParams, AnalysisResult, Summary } from '../../shared/types.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

initDataStore();

router.get('/segments', (_req: Request, res: Response) => {
  res.json(getSegments());
});

router.get('/corridors', (_req: Request, res: Response) => {
  res.json(getCorridors());
});

router.post('/analysis', (req: Request, res: Response) => {
  const { filter }: { filter: FilterParams } = req.body;
  
  const allSegments = getSegments();
  const allSamples = getSamples();

  const filteredSegments = filterSegmentsByCorridor(allSegments, filter.corridors);
  const filteredSamples = filterSamplesByDate(allSamples, filter.startDate, filter.endDate);

  const analyzed = analyzeSegments(filteredSegments, filteredSamples, allSamples);
  
  const intensities = analyzed.map(s => s.avgLeakageIntensity);
  const maxIdx = intensities.indexOf(Math.max(...intensities));
  
  const summary: Summary = {
    totalSegments: analyzed.length,
    abnormalSegments: analyzed.filter(s => s.avgLeakageIntensity > 0).length,
    avgIntensity: intensities.length > 0 
      ? Math.round(intensities.reduce((a, b) => a + b, 0) / intensities.length * 1000) / 1000 
      : 0,
    maxIntensitySegment: maxIdx >= 0 ? analyzed[maxIdx].segmentId : '-',
    maxIntensity: Math.round(Math.max(0, ...intensities) * 1000) / 1000,
  };

  const result: AnalysisResult = {
    segments: analyzed.sort((a, b) => b.avgLeakageIntensity - a.avgLeakageIntensity),
    summary,
  };

  res.json(result);
});

router.get('/export', (req: Request, res: Response) => {
  const corridors = (req.query.corridors as string)?.split(',').filter(Boolean) || [];
  const startDate = req.query.startDate as string || '';
  const endDate = req.query.endDate as string || '';

  const filter: FilterParams = { corridors, startDate, endDate };

  const allSegments = getSegments();
  const allSamples = getSamples();
  const filteredSegments = filterSegmentsByCorridor(allSegments, corridors);
  const filteredSamples = filterSamplesByDate(allSamples, startDate, endDate);
  const analyzed = analyzeSegments(filteredSegments, filteredSamples, allSamples);

  const csv = generateAnalysisCsv(analyzed, filter);
  const filename = `渗漏分析_${new Date().toISOString().slice(0, 10)}.csv`;
  
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send('\uFEFF' + csv);
});

router.post('/import', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: '未上传文件', count: 0 });
    return;
  }

  try {
    const content = req.file.buffer.toString('utf-8');
    const samples = parseSamplesCsv(content);
    const count = addSamples(samples);
    res.json({ success: true, count, total: samples.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : '导入失败';
    res.status(400).json({ success: false, error: message, count: 0 });
  }
});

router.get('/sample-template', (_req: Request, res: Response) => {
  const csv = generateSamplesCsv();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="采样数据导入模板.csv"');
  res.send('\uFEFF' + csv);
});

router.post('/reset', (_req: Request, res: Response) => {
  resetToSeed();
  res.json({ success: true });
});

export default router;
