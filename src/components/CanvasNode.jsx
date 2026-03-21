import { useRef, useState, useCallback } from 'react';
import { CATEGORIES } from '../data/catalog';
import { getCloudLabel, getCloudDesc } from '../data/catalog';

export default function CanvasNode({
  node, cloud, isSelected, isConnectSource, connectMode, onMouseDown, onClick,
}) {
  const catColor = CATEGORIES[node.category]?.color || '#888';
  const catIcon = CATEGORIES[node.category]?.icon || '?';
  const label = getCloudLabel(node.serviceId, cloud);
  const desc = getCloudDesc(node.serviceId, cloud);

  const w = 160;
  const h = 72;

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onMouseDown={onMouseDown}
      onClick={onClick}
      style={{ cursor: connectMode ? 'crosshair' : 'grab' }}
    >
      {/* Selection highlight */}
      {isSelected && (
        <rect
          x={-w / 2 - 3} y={-h / 2 - 3}
          width={w + 6} height={h + 6}
          rx={12} fill="none"
          stroke={catColor} strokeWidth={2}
          strokeDasharray="6,3"
          opacity={0.8}
        >
          <animate attributeName="stroke-dashoffset" values="0;18" dur="1s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Connect source highlight */}
      {isConnectSource && (
        <rect
          x={-w / 2 - 4} y={-h / 2 - 4}
          width={w + 8} height={h + 8}
          rx={13} fill="none"
          stroke="#22d3ee" strokeWidth={2.5}
        >
          <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Background card */}
      <rect
        x={-w / 2} y={-h / 2}
        width={w} height={h}
        rx={10}
        fill={isSelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'}
        stroke={isSelected ? catColor : 'rgba(255,255,255,0.12)'}
        strokeWidth={isSelected ? 1.5 : 1}
      />

      {/* Category color bar */}
      <rect
        x={-w / 2} y={-h / 2}
        width={4} height={h}
        rx={2}
        fill={catColor}
        opacity={0.8}
      />

      {/* Icon */}
      <text
        x={-w / 2 + 18}
        y={-h / 2 + 24}
        fontSize="18"
        textAnchor="middle"
      >
        {catIcon}
      </text>

      {/* Label */}
      <text
        x={-w / 2 + 32}
        y={-h / 2 + 22}
        fill="#fff"
        fontSize="11"
        fontWeight="600"
        fontFamily="'Inter', system-ui, sans-serif"
      >
        {label.length > 18 ? label.slice(0, 18) + '…' : label}
      </text>

      {/* Description */}
      <text
        x={-w / 2 + 32}
        y={-h / 2 + 38}
        fill="rgba(255,255,255,0.4)"
        fontSize="8"
        fontFamily="'Inter', system-ui, sans-serif"
      >
        {desc.length > 28 ? desc.slice(0, 28) + '…' : desc}
      </text>

      {/* Category badge */}
      <rect
        x={-w / 2 + 12}
        y={h / 2 - 20}
        width={w - 24}
        height={14}
        rx={3}
        fill={`${catColor}20`}
      />
      <text
        x={0}
        y={h / 2 - 10}
        fill={catColor}
        fontSize="8"
        fontWeight="600"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
      >
        {CATEGORIES[node.category]?.label.toUpperCase()}
      </text>

      {/* Connection anchor points (visible in connect mode) */}
      {connectMode && (
        <>
          <circle cx={0} cy={-h / 2} r={4} fill={catColor} opacity={0.6} />
          <circle cx={0} cy={h / 2} r={4} fill={catColor} opacity={0.6} />
          <circle cx={-w / 2} cy={0} r={4} fill={catColor} opacity={0.6} />
          <circle cx={w / 2} cy={0} r={4} fill={catColor} opacity={0.6} />
        </>
      )}
    </g>
  );
}
