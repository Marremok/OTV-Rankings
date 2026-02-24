"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { getScoreColor } from "./pillar-utils";

export interface PillarData {
  name: string;
  score: number;
  icon: LucideIcon;
  color?: string;
  raterCount?: number;
}

interface RadarChartProps {
  pillars: PillarData[];
  size?: number;
  animated?: boolean;
}

/**
 * RadarChart - Stunning pentagon visualization for rating pillars
 * Features gradient fills, glow effects, and interactive hover states
 */
export function RadarChart({ pillars, size = 320, animated = true }: RadarChartProps) {
  const center = size / 2;
  const radius = size * 0.32;
  const levels = 5;

  // Calculate point position on the pentagon
  const getPoint = (index: number, value: number, customRadius?: number) => {
    const angle = (Math.PI * 2 * index) / pillars.length - Math.PI / 2;
    const r = customRadius ?? (value / 10) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate grid polygons for each level
  const gridLines = Array.from({ length: levels }, (_, i) => {
    const levelRadius = ((i + 1) / levels) * radius;
    return pillars
      .map((_, index) => {
        const point = getPoint(index, 0, levelRadius);
        return `${point.x},${point.y}`;
      })
      .join(" ");
  });

  // Generate data polygon points
  const dataPoints = pillars
    .map((pillar, index) => {
      const point = getPoint(index, pillar.score);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  // Generate axis lines from center to each vertex
  const axisLines = pillars.map((_, index) => getPoint(index, 0, radius));

  // Label positions (outside the chart)
  const labelPositions = pillars.map((pillar, index) => {
    const labelRadius = radius + 50;
    const point = getPoint(index, 0, labelRadius);
    return { ...point, pillar };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow effect */}
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />

      {/* SVG Chart */}
      <svg
        width={size}
        height={size}
        className={cn("relative z-10", animated && "animate-in fade-in zoom-in-95 duration-1000")}
      >
        <defs>
          {/* Gradient for the data polygon */}
          <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.1" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Drop shadow for points */}
          <filter id="pointShadow" x="-100%" y="-100%" width="300%" height="300%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="var(--primary)" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Grid levels */}
        {gridLines.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth={i === levels - 1 ? 1.5 : 0.5}
            className={cn(
              "transition-colors duration-300",
              i === levels - 1 ? "text-zinc-700" : "text-zinc-800/60"
            )}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((point, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-zinc-800/60"
          />
        ))}

        {/* Data polygon with gradient fill */}
        <polygon
          points={dataPoints}
          fill="url(#dataGradient)"
          stroke="var(--primary)"
          strokeWidth="2.5"
          filter="url(#glow)"
          className={cn(
            "transition-all duration-700",
            animated && "animate-in fade-in duration-1000 delay-300"
          )}
        />

        {/* Data points with glow */}
        {pillars.map((pillar, index) => {
          const point = getPoint(index, pillar.score);
          return (
            <g key={index}>
              {/* Outer glow ring */}
              <circle
                cx={point.x}
                cy={point.y}
                r="12"
                fill="var(--primary)"
                opacity="0.15"
                className={cn(
                  animated && "animate-in fade-in duration-500",
                  `delay-[${400 + index * 100}ms]`
                )}
              />
              {/* Inner point */}
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="var(--primary)"
                filter="url(#pointShadow)"
                className={cn(
                  "transition-all duration-300 hover:r-8",
                  animated && "animate-in fade-in zoom-in duration-500",
                  `delay-[${400 + index * 100}ms]`
                )}
              />
              {/* Center highlight */}
              <circle
                cx={point.x}
                cy={point.y}
                r="2"
                fill="white"
                opacity="0.8"
              />
            </g>
          );
        })}

        {/* Center decoration */}
        <circle cx={center} cy={center} r="4" fill="var(--primary)" opacity="0.3" />
        <circle cx={center} cy={center} r="2" fill="var(--primary)" opacity="0.6" />
      </svg>

      {/* Labels positioned around the chart */}
      {labelPositions.map(({ x, y, pillar }, index) => {
        const Icon = pillar.icon;
        return (
          <div
            key={index}
            className={cn(
              "absolute flex flex-col items-center gap-1.5 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110",
              animated && "animate-in fade-in slide-in-from-bottom-2 duration-500",
            )}
            style={{
              left: x,
              top: y,
              animationDelay: `${500 + index * 100}ms`,
            }}
          >
            {/* Icon with background */}
            <div className={cn(
              "p-2 rounded-xl transition-colors duration-300",
              "bg-zinc-800/50 hover:bg-zinc-700/50"
            )}>
              <Icon className="h-4 w-4 text-zinc-400" />
            </div>

            {/* Pillar name */}
            <span className="text-xs font-medium text-zinc-500 whitespace-nowrap">
              {pillar.name}
            </span>

            {/* Score */}
            <span className={cn("text-base font-bold tabular-nums", getScoreColor(pillar.score).text)}>
              {pillar.score.toFixed(2)}
            </span>

           
          </div>
        );
      })}
    </div>
  );
}
