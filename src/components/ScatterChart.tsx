import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { SegmentLeakage } from '../types';

interface ScatterChartProps {
  data: SegmentLeakage[];
  maxIntensity: number;
}

export function ScatterChart({ data, maxIntensity }: ScatterChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');
    }

    const scatterData = data.map(s => [
      s.neighborAvgIntensity,
      s.avgLeakageIntensity,
      s.segmentId,
      s.corridor,
    ]);

    const maxVal = Math.max(maxIntensity, 1);

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(249, 115, 22, 0.3)',
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        formatter: (params: unknown) => {
          const p = params as { value: number[]; marker: string };
          return `
            <div class="font-semibold mb-1">${p.value[2]}</div>
            <div class="text-xs text-zinc-400 mb-1">${p.value[3]}</div>
            <div class="flex items-center gap-2 text-xs">
              ${p.marker}
              <span>本段强度:</span>
              <span class="font-mono font-semibold text-orange-300">${p.value[1].toFixed(3)}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span class="inline-block w-2 h-2 rounded-full bg-zinc-500 mr-1"></span>
              <span>邻段平均:</span>
              <span class="font-mono font-semibold">${p.value[0].toFixed(3)}</span>
            </div>
          `;
        },
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '10%',
      },
      xAxis: {
        type: 'value',
        name: '邻段平均强度',
        nameTextStyle: { color: '#64748b', fontSize: 10 },
        min: 0,
        max: maxVal * 1.1,
        axisLabel: {
          color: '#64748b',
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace',
        },
        splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.3)' } },
        axisLine: { lineStyle: { color: '#334155' } },
      },
      yAxis: {
        type: 'value',
        name: '本段渗漏强度',
        nameTextStyle: { color: '#64748b', fontSize: 10 },
        min: 0,
        max: maxVal * 1.1,
        axisLabel: {
          color: '#64748b',
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace',
        },
        splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.3)' } },
        axisLine: { lineStyle: { color: '#334155' } },
      },
      series: [
        {
          type: 'line',
          name: 'y = x',
          data: [[0, 0], [maxVal * 1.1, maxVal * 1.1]],
          lineStyle: {
            color: 'rgba(100, 116, 139, 0.4)',
            type: 'dashed',
            width: 1,
          },
          symbol: 'none',
          silent: true,
        },
        {
          type: 'scatter',
          name: '管廊段',
          data: scatterData,
          symbolSize: 14,
          itemStyle: {
            color: (params: unknown) => {
              const p = params as { value: number[] };
              const intensity = p.value[1];
              if (intensity <= 0) return 'rgba(75, 85, 99, 0.8)';
              const ratio = Math.min(1, intensity / maxIntensity);
              const r = Math.round(14 + ratio * 239);
              const g = Math.round(165 - ratio * 90);
              const b = Math.round(233 - ratio * 100);
              return `rgba(${r}, ${g}, ${b}, 0.9)`;
            },
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderWidth: 1,
            shadowBlur: 10,
            shadowColor: 'rgba(14, 165, 233, 0.3)',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(14, 165, 233, 0.6)',
              borderWidth: 2,
            },
          },
          label: {
            show: true,
            formatter: (params: unknown) => {
              const p = params as { value: string[] };
              return p.value[2];
            },
            position: 'top',
            color: '#94a3b8',
            fontSize: 9,
            fontFamily: 'JetBrains Mono, monospace',
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
  }, [data, maxIntensity]);

  return (
    <div className="h-full w-full">
      <div ref={chartRef} className="h-[320px] w-full" />
    </div>
  );
}
