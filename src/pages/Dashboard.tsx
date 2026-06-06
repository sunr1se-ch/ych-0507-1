import { useEffect, useState, useCallback } from 'react';
import { Gauge, AlertTriangle, TrendingUp, MapPin, RefreshCw, Database } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { exportAnalysis } from '../utils/api';
import { StatCard } from '../components/StatCard';
import { FilterBar } from '../components/FilterBar';
import { BarChart } from '../components/BarChart';
import { ScatterChart } from '../components/ScatterChart';
import { TopologyChart } from '../components/TopologyChart';
import { DataTable } from '../components/DataTable';
import { ImportModal } from '../components/ImportModal';
import { formatNumber } from '../utils/format';

export default function Dashboard() {
  const { filter, result, loading, loadCorridors, loadAnalysis } = useDashboardStore();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [dataUpdatedAt, setDataUpdatedAt] = useState<string>('');

  const loadAll = useCallback(() => {
    loadCorridors();
    loadAnalysis();
    setDataUpdatedAt(new Date().toLocaleString('zh-CN'));
  }, [loadCorridors, loadAnalysis]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAnalysis();
    }, 200);
    return () => clearTimeout(timer);
  }, [filter.corridors, filter.startDate, filter.endDate, loadAnalysis]);

  const handleExport = () => {
    exportAnalysis(filter);
  };

  const handleImportSuccess = () => {
    loadAll();
  };

  const ChartSection = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={`rounded-xl border border-zinc-700/50 bg-zinc-900/50 backdrop-blur ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
        <button
          onClick={loadAnalysis}
          className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-sky-400"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-zinc-100">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-950/80" />
      
      <div className="relative mx-auto max-w-[1800px] px-6 py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-500/30">
                <Gauge size={24} className="text-sky-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                    地下管廊渗漏监测
                  </span>
                </h1>
                <p className="text-sm text-zinc-500">
                  市政运维中心 · 渗漏水导率与相邻检查井负荷对比看板
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[11px] text-zinc-600">数据更新时间</p>
                <p className="font-mono text-xs text-zinc-400">{dataUpdatedAt || '--'}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-sky-300">系统运行中</span>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-5">
          <FilterBar onImport={() => setImportModalOpen(true)} onExport={handleExport} />
        </div>

        {loading && !result && (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-sky-500/30 border-t-sky-400" />
              <p className="text-sm text-zinc-500">正在加载分析数据...</p>
            </div>
          </div>
        )}

        {result && (
          <>
            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="管廊总段数"
                value={result.summary.totalSegments}
                subtitle="纳入监测"
                icon={<Database size={18} />}
                accent="default"
                delay={0}
              />
              <StatCard
                title="渗漏异常段"
                value={result.summary.abnormalSegments}
                subtitle={`占比 ${result.summary.totalSegments > 0 ? Math.round(result.summary.abnormalSegments / result.summary.totalSegments * 100) : 0}%`}
                icon={<AlertTriangle size={18} />}
                accent={result.summary.abnormalSegments > 3 ? 'danger' : 'warning'}
                delay={100}
              />
              <StatCard
                title="平均渗漏强度"
                value={formatNumber(result.summary.avgIntensity)}
                subtitle="水导率/日"
                icon={<TrendingUp size={18} />}
                accent={result.summary.avgIntensity > 2 ? 'warning' : 'success'}
                delay={200}
              />
              <StatCard
                title="最高强度段"
                value={result.summary.maxIntensitySegment}
                subtitle={`强度 ${formatNumber(result.summary.maxIntensity)}`}
                icon={<MapPin size={18} />}
                accent="danger"
                delay={300}
              />
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
              <ChartSection title="各段平均渗漏强度对比" className="lg:col-span-3">
                <BarChart data={result.segments} maxIntensity={result.summary.maxIntensity} />
              </ChartSection>
              <ChartSection title="本段 vs 邻段强度对比" className="lg:col-span-2">
                <ScatterChart data={result.segments} maxIntensity={result.summary.maxIntensity} />
              </ChartSection>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <ChartSection title="节点位置示意图">
                <TopologyChart data={result.segments} maxIntensity={result.summary.maxIntensity} />
              </ChartSection>
              <ChartSection title="数据明细">
                <div className="h-[320px]">
                  <DataTable data={result.segments} maxIntensity={result.summary.maxIntensity} />
                </div>
              </ChartSection>
            </div>
          </>
        )}

        <footer className="mt-8 border-t border-zinc-800/50 pt-4 text-center text-[11px] text-zinc-600">
          © 2025 市政运维中心 · 地下管廊智能监测系统 v1.0
        </footer>
      </div>

      <ImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
