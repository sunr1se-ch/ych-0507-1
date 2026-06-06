import { useDashboardStore } from '../store/useDashboardStore';
import { Filter, RotateCcw, Download, Upload, FileDown } from 'lucide-react';

interface FilterBarProps {
  onImport: () => void;
  onExport: () => void;
}

export function FilterBar({ onImport, onExport }: FilterBarProps) {
  const { corridors, filter, setFilter, resetFilter, loadAnalysis } = useDashboardStore();

  const toggleCorridor = (corridor: string) => {
    const current = filter.corridors;
    const next = current.includes(corridor)
      ? current.filter(c => c !== corridor)
      : [...current, corridor];
    setFilter({ corridors: next });
  };

  const handleReset = () => {
    resetFilter();
    setTimeout(loadAnalysis, 50);
  };

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-4 backdrop-blur">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Filter size={16} />
          <span className="font-medium">廊道筛选：</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {corridors.map((corridor) => (
            <button
              key={corridor}
              onClick={() => toggleCorridor(corridor)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-200 ${
                filter.corridors.includes(corridor)
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                  : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              {corridor}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-zinc-700/50" />

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400">开始日期</label>
          <input
            type="date"
            value={filter.startDate}
            onChange={(e) => setFilter({ startDate: e.target.value })}
            className="rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-200 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400">结束日期</label>
          <input
            type="date"
            value={filter.endDate}
            onChange={(e) => setFilter({ endDate: e.target.value })}
            className="rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-200 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300"
          >
            <RotateCcw size={14} />
            重置
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
          >
            <Download size={14} />
            导出
          </button>
          <button
            onClick={onImport}
            className="flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-500/20"
          >
            <Upload size={14} />
            导入采样
          </button>
          <button
            onClick={() => window.open('/api/dashboard/sample-template', '_blank')}
            className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300"
          >
            <FileDown size={14} />
            模板
          </button>
        </div>
      </div>
    </div>
  );
}
