import { useState } from 'react';
import ICONS from '../data/icons';

export default function ArchNode({ id, x, y, component, cloud, load, cloudColor, onClick }) {
  const [hovered, setHovered] = useState(false);
  const loadPct = Math.min(load / component.maxRps, 1);

  // Color interpolation: green -> yellow -> red based on load
  const r = Math.round(loadPct > 0.5 ? 255 : loadPct * 2 * 255);
  const g = Math.round(loadPct < 0.5 ? 255 : (1 - (loadPct - 0.5) * 2) * 255);
  const loadColor = `rgb(${r},${g},60)`;

  const iconSvg = ICONS[id] ? ICONS[id](hovered ? '#fff' : cloudColor) : '';
  const nodeWidth = 140;
  const nodeHeight = 90;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(id)}
      style={{ cursor: 'pointer' }}
    >
      {/* Background */}
      <rect
        x={-nodeWidth / 2}
        y={-nodeHeight / 2}
        width={nodeWidth}
        height={nodeHeight}
        rx={10}
        fill={hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}
        stroke={hovered ? cloudColor : 'rgba(255,255,255,0.15)'}
        strokeWidth={hovered ? 2 : 1}
      />

      {/* Icon */}
      <g
        transform={`translate(${-nodeWidth / 2 + 8}, ${-nodeHeight / 2 + 8})`}
        dangerouslySetInnerHTML={{ __html: iconSvg }}
      />

      {/* Label */}
      <text
        x={10}
        y={-nodeHeight / 2 + 22}
        fill="#fff"
        fontSize="11"
        fontWeight="600"
        fontFamily="'Inter', system-ui, sans-serif"
      >
        {component.label}
      </text>

      {/* Description */}
      <text
        x={-nodeWidth / 2 + 10}
        y={nodeHeight / 2 - 28}
        fill="rgba(255,255,255,0.5)"
        fontSize="8"
        fontFamily="'Inter', system-ui, sans-serif"
      >
        {component.desc.length > 28 ? component.desc.slice(0, 28) + '...' : component.desc}
      </text>

      {/* Load bar background */}
      <rect
        x={-nodeWidth / 2 + 10}
        y={nodeHeight / 2 - 18}
        width={nodeWidth - 20}
        height={6}
        rx={3}
        fill="rgba(255,255,255,0.08)"
      />

      {/* Load bar fill */}
      <rect
        x={-nodeWidth / 2 + 10}
        y={nodeHeight / 2 - 18}
        width={Math.max(2, (nodeWidth - 20) * loadPct)}
        height={6}
        rx={3}
        fill={loadColor}
        style={{ transition: 'width 0.3s ease, fill 0.3s ease' }}
      />

      {/* Load percentage */}
      <text
        x={nodeWidth / 2 - 10}
        y={nodeHeight / 2 - 8}
        fill={loadColor}
        fontSize="8"
        fontWeight="700"
        textAnchor="end"
        fontFamily="'JetBrains Mono', monospace"
      >
        {Math.round(loadPct * 100)}%
      </text>

      {/* RPS count */}
      <text
        x={-nodeWidth / 2 + 10}
        y={nodeHeight / 2 - 8}
        fill="rgba(255,255,255,0.4)"
        fontSize="8"
        fontFamily="'JetBrains Mono', monospace"
      >
        {load >= 1000 ? `${(load / 1000).toFixed(1)}k` : load} rps
      </text>

      {/* Pulse animation when overloaded */}
      {loadPct > 0.85 && (
        <rect
          x={-nodeWidth / 2}
          y={-nodeHeight / 2}
          width={nodeWidth}
          height={nodeHeight}
          rx={10}
          fill="none"
          stroke="red"
          strokeWidth={2}
          opacity={0.6}
        >
          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
}
