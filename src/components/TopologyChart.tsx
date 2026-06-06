import { useMemo, useState } from 'react';
import type { SegmentLeakage } from '../types';
import { getIntensityColor, getIntensityLevel } from '../utils/format';

interface TopologyChartProps {
  data: SegmentLeakage[];
  maxIntensity: number;
}

interface HoveredSegment {
  segment: SegmentLeakage;
  x: number;
  y: number;
}

export function TopologyChart({ data, maxIntensity }: TopologyChartProps) {
  const [hovered, setHovered] = useState<HoveredSegment | null>(null);

  const corridors = useMemo(() => {
    const map = new Map<string, SegmentLeakage[]>();
    for (const seg of data) {
      if (!map.has(seg.corridor)) {
        map.set(seg.corridor, []);
      }
      map.get(seg.corridor)!.push(seg);
    }
    for (const [, segs] of map) {
      segs.sort((a, b) => a.upstreamNode.localeCompare(b.upstreamNode));
    }
    return Array.from(map.entries());
  }, [data]);

  const totalWidth = 900;
  const rowHeight = 80;
  const paddingTop = 50;
  const paddingBottom = 30;
  const height = corridors.length * rowHeight + paddingTop + paddingBottom;

  const renderCorridor = (
    corridorName: string,
    segments: SegmentLeakage[],
    rowIndex: number
  ) => {
    const y = paddingTop + rowIndex * rowHeight + rowHeight / 2;
    const segWidth = segments.length > 0 ? (totalWidth - 120) / segments.length : 0;

    return (
      <g key={corridorName}>
        <text
          x={10}
          y={y + 4}
          fill="#94a3b8"
          fontSize="11"
          fontWeight="500"
          className="select-none"
        >
          {corridorName}
        </text>

        <line
          x1={80}
          y1={y}
          x2={totalWidth - 20}
          y2={y}
          stroke="#334155"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.5"
        />

        {segments.map((seg, idx) => {
          const xStart = 80 + idx * segWidth + 10;
          const xEnd = 80 + (idx + 1) * segWidth - 10;
          const color = getIntensityColor(seg.avgLeakageIntensity, maxIntensity);
          const level = getIntensityLevel(seg.avgLeakageIntensity, maxIntensity);
          const intensityNorm = maxIntensity > 0 ? (seg.avgLeakageIntensity / maxIntensity) * 100 : 0;

          return (
            <g key={seg.segmentId}>
              <rect
                x={xStart}
                y={y - 8}
                width={xEnd - xStart}
                height={16}
                rx={4}
                fill={color}
                opacity={0.85}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={(e) => setHovered({
                  segment: seg,
                  x: e.clientX,
                  y: e.clientY,
                })}
                onMouseMove={(e) => setHovered((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                onMouseLeave={() => setHovered(null)}
                style={{ filter: `drop-shadow(0 0 ${intensityNorm / 15}px ${color})` }}
              />
              <text
                x={(xStart + xEnd) / 2}
                y={y + 4}
                textAnchor="middle"
                fill={seg.avgLeakageIntensity > maxIntensity * 0.5 ? '#ffffff' : '#cbd5e1'}
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                className="pointer-events-none select-none"
              >
                {seg.segmentId.slice(-3)}
              </text>
              {idx < segments.length - 1 && (
                <circle
                  cx={xEnd + 5}
                  cy={y}
                  r={5}
                  fill="#0ea5e9"
                  className="pointer-events-none"
                />
              )}
              {idx === 0 && (
                <>
                  <circle cx={xStart - 5} cy={y} r={6} fill="#f97316" stroke="#fff" strokeWidth="1.5" />
                  <text
                    x={xStart - 5}
                    y={y - 18}
                    textAnchor="middle"
                    fill="#f97316"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    className="select-none"
                  >
                    {seg.upstreamNode}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {segments.length > 0 && (
          <>
            <circle
              cx={80 + segments.length * segWidth - 10}
              cy={y}
              r={6}
              fill="#22c55e"
              stroke="#fff"
              strokeWidth="1.5"
            />
            <text
              x={80 + segments.length * segWidth - 10}
              y={y - 18}
              textAnchor="middle"
              fill="#22c55e"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
              className="select-none"
            >
              {segments[segments.length - 1].upstreamNode.replace(/\d$/, (m) => String(parseInt(m) + 1))}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="h-[320px] w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51,65,85,0.3)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {corridors.map(([name, segs], idx) => renderCorridor(name, segs, idx))}

        <g transform={`translate(30, ${height - 20})`}>
          {[0, 0.3, 0.6, 0.9, 1].map((ratio, i) => {
            const color = getIntensityColor(ratio * maxIntensity, maxIntensity);
            return (
              <g key={i} transform={`translate(${i * 140}, 0)`}>
                <rect width="20" height="10" rx={2} fill={color} />
                <text x={28} y={8} fill="#64748b" fontSize="9">
                  {getIntensityLevel(ratio * maxIntensity, maxIntensity)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {hovered && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-zinc-700 bg-zinc-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
          style={{
            left: hovered.x + 15,
            top: hovered.y + 15,
          }}
        >
          <div className="font-mono font-semibold text-sky-300">{hovered.segment.segmentId}</div>
          <div className="text-zinc-400">{hovered.segment.corridor}</div>
          <div className="mt-1 space-y-0.5">
            <div className="flex justify-between gap-6">
              <span className="text-zinc-500">渗漏强度</span>
              <span className="font-mono text-orange-300">{hovered.segment.avgLeakageIntensity.toFixed(3)}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-zinc-500">邻段平均</span>
              <span className="font-mono">{hovered.segment.neighborAvgIntensity.toFixed(3)}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-zinc-500">采样次数</span>
              <span className="font-mono">{hovered.segment.sampleCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
