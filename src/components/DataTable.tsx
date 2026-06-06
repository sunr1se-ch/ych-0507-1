import { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SegmentLeakage } from '../types';
import { formatNumber, getIntensityColor, getIntensityLevel } from '../utils/format';

interface DataTableProps {
  data: SegmentLeakage[];
  maxIntensity: number;
}

type SortKey = 'segmentId' | 'corridor' | 'avgLeakageIntensity' | 'neighborAvgIntensity' | 'sampleCount';
type SortDirection = 'asc' | 'desc';

export function DataTable({ data, maxIntensity }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('avgLeakageIntensity');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);
  const pageSize = 6;

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'segmentId':
          cmp = a.segmentId.localeCompare(b.segmentId);
          break;
        case 'corridor':
          cmp = a.corridor.localeCompare(b.corridor);
          break;
        case 'avgLeakageIntensity':
          cmp = a.avgLeakageIntensity - b.avgLeakageIntensity;
          break;
        case 'neighborAvgIntensity':
          cmp = a.neighborAvgIntensity - b.neighborAvgIntensity;
          break;
        case 'sampleCount':
          cmp = a.sampleCount - b.sampleCount;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pageData = sortedData.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ active, direction }: { active: boolean; direction: SortDirection }) => (
    <ArrowUpDown
      size={14}
      className={`transition-colors ${active ? 'text-sky-400' : 'text-zinc-600'} ${
        active && direction === 'asc' ? 'rotate-180' : ''
      }`}
    />
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur">
            <tr className="border-b border-zinc-800">
              <th
                className="cursor-pointer px-3 py-2.5 text-left text-xs font-medium text-zinc-400 hover:text-zinc-200"
                onClick={() => handleSort('segmentId')}
              >
                <div className="flex items-center gap-1">
                  段号
                  <SortIcon active={sortKey === 'segmentId'} direction={sortDir} />
                </div>
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 text-left text-xs font-medium text-zinc-400 hover:text-zinc-200"
                onClick={() => handleSort('corridor')}
              >
                <div className="flex items-center gap-1">
                  廊道
                  <SortIcon active={sortKey === 'corridor'} direction={sortDir} />
                </div>
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 text-right text-xs font-medium text-zinc-400 hover:text-zinc-200"
                onClick={() => handleSort('avgLeakageIntensity')}
              >
                <div className="flex items-center justify-end gap-1">
                  渗漏强度
                  <SortIcon active={sortKey === 'avgLeakageIntensity'} direction={sortDir} />
                </div>
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 text-right text-xs font-medium text-zinc-400 hover:text-zinc-200"
                onClick={() => handleSort('neighborAvgIntensity')}
              >
                <div className="flex items-center justify-end gap-1">
                  邻段平均
                  <SortIcon active={sortKey === 'neighborAvgIntensity'} direction={sortDir} />
                </div>
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-medium text-zinc-400">
                风险等级
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 text-center text-xs font-medium text-zinc-400 hover:text-zinc-200"
                onClick={() => handleSort('sampleCount')}
              >
                <div className="flex items-center justify-center gap-1">
                  采样
                  <SortIcon active={sortKey === 'sampleCount'} direction={sortDir} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {pageData.map((seg, idx) => {
              const color = getIntensityColor(seg.avgLeakageIntensity, maxIntensity);
              const level = getIntensityLevel(seg.avgLeakageIntensity, maxIntensity);
              const contrast = seg.avgLeakageIntensity - seg.neighborAvgIntensity;
              
              return (
                <tr
                  key={seg.segmentId}
                  className="transition-colors hover:bg-zinc-800/30"
                  style={{
                    animation: `fadeIn 0.4s ease-out ${idx * 50}ms both`,
                  }}
                >
                  <td className="px-3 py-2.5 font-mono text-xs text-zinc-200">{seg.segmentId}</td>
                  <td className="px-3 py-2.5 text-xs text-zinc-400">{seg.corridor}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className="font-mono text-xs font-semibold"
                      style={{ color }}
                    >
                      {formatNumber(seg.avgLeakageIntensity)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-zinc-500">
                    {formatNumber(seg.neighborAvgIntensity)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: `${color}20`,
                        color,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      {level}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-xs text-zinc-500">
                    {seg.sampleCount}
                  </td>
                </tr>
              );
            })}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-zinc-600">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-2">
          <span className="text-xs text-zinc-500">
            共 {sortedData.length} 条，第 {page + 1}/{totalPages} 页
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded border border-zinc-700 bg-zinc-800/50 p-1 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`min-w-[24px] rounded border px-1.5 py-0.5 text-xs font-medium transition-colors ${
                  page === i
                    ? 'border-sky-500/50 bg-sky-500/20 text-sky-300'
                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="rounded border border-zinc-700 bg-zinc-800/50 p-1 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
