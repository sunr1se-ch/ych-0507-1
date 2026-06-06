import { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';
import type { SegmentLeakage } from '../types';
import { useDashboardStore } from '../store/useDashboardStore';

interface BarChartProps {
  data: SegmentLeakage[];
  maxIntensity: number;
}

export function BarChart({ data, maxIntensity }: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { focusedSegmentId, setFocusedSegment } = useDashboardStore();

  const sorted = useCallback(() => {
    return [...data].sort((a, b) => b.avgLeakageIntensity - a.avgLeakageIntensity);
  }, [data])();

  const focusedIndex = sorted.findIndex(s => s.segmentId === focusedSegmentId);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');

      chartInstance.current.on('click', (params: unknown) => {
        const p = params as { name: string };
        if (p.name) {
          setFocusedSegment(p.name);
        }
      });
    }

    const segmentIds = sorted.map(s => s.segmentId);
    const intensities = sorted.map((s, idx) => ({
      value: s.avgLeakageIntensity,
      itemStyle: focusedSegmentId
        ? (idx === focusedIndex
            ? {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#fbbf24' },
                  { offset: 1, color: '#f59e0b' },
                ]),
                shadowBlur: 15,
                shadowColor: 'rgba(251, 191, 36, 0.6)',
              }
            : { opacity: 0.25 })
        : undefined,
    }));
    const neighborIntensities = sorted.map((s, idx) => ({
      value: s.neighborAvgIntensity,
      itemStyle: focusedSegmentId && idx !== focusedIndex ? { opacity: 0.25 } : undefined,
    }));

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(56, 189, 248, 0.3)',
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        formatter: (params: unknown) => {
          const p = params as Array<{ name: string; seriesName: string; value: number; marker: string }>;
          let html = `<div class="font-semibold mb-1">${p[0].name}</div>`;
          for (const item of p) {
            html += `<div class="flex items-center gap-2 text-xs">
              ${item.marker}
              <span>${item.seriesName}:</span>
              <span class="font-mono font-semibold">${item.value.toFixed(3)}</span>
            </div>`;
          }
          return html;
        },
      },
      legend: {
        data: ['本段渗漏强度', '邻段平均强度'],
        top: 0,
        right: 0,
        textStyle: { color: '#94a3b8', fontSize: 11 },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: segmentIds,
        axisLabel: {
          color: (value: string | number, index: number) => {
            const id = segmentIds[index];
            return focusedSegmentId
              ? (id === focusedSegmentId ? '#fbbf24' : '#475569')
              : '#64748b';
          },
          fontSize: 10,
          rotate: 35,
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: (value: string | number, index: number) => {
            const id = segmentIds[index];
            return (focusedSegmentId && id === focusedSegmentId) ? 'bold' : 'normal';
          },
        },
        axisLine: { lineStyle: { color: '#334155' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        name: '渗漏强度',
        nameTextStyle: { color: '#64748b', fontSize: 10 },
        axisLabel: {
          color: '#64748b',
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace',
        },
        splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.3)' } },
      },
      series: [
        {
          name: '本段渗漏强度',
          type: 'bar',
          data: intensities,
          barWidth: '35%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#0ea5e9' },
              { offset: 1, color: '#0284c7' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#38bdf8' },
                { offset: 1, color: '#0ea5e9' },
              ]),
            },
          },
        },
        {
          name: '邻段平均强度',
          type: 'bar',
          data: neighborIntensities,
          barWidth: '35%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#64748b' },
              { offset: 1, color: '#475569' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
      animationDuration: 800,
      animationEasing: 'cubicOut',
    };

    chartInstance.current.setOption(option, true);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, maxIntensity, focusedSegmentId, focusedIndex, sorted, setFocusedSegment]);

  return (
    <div className="h-full w-full">
      <div ref={chartRef} className="h-[320px] w-full" />
    </div>
  );
}
