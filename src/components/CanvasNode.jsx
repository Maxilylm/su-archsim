import { memo } from 'react';
import { CATEGORIES } from '../data/catalog';
import { getCloudLabel, getCloudDesc } from '../data/catalog';
import { computeNodeLoad, getMaxRps, getLoadColor } from '../data/traffic';
import { formatRps } from '../data/traffic';

const CanvasNode = memo(function CanvasNode({
  node, cloud, isSelected, isConnectSource, connectMode, sliders, isFailed, onMouseDown, onTouchStart, onClick,
}) {
  const catColor = CATEGORIES[node.category]?.color || '#888';
  const catIcon = CATEGORIES[node.category]?.icon || '?';
  const label = getCloudLabel(node.serviceId, cloud);
  const desc = getCloudDesc(node.serviceId, cloud);

  const loadPct = isFailed ? 0 : computeNodeLoad(node.serviceId, node.category, sliders);
  const loadColor = isFailed ? '#ef4444' : getLoadColor(loadPct);
  const maxRps = getMaxRps(node.serviceId);
  const currentRps = Math.round(maxRps * loadPct);
  const hasTraffic = !isFailed && loadPct > 0.01;

  const w = 160;
  const h = 88;

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onClick={onClick}
      style={{ cursor: connectMode ? 'crosshair' : 'grab', touchAction: 'none', opacity: isFailed ? 0.5 : 1 }}
      role="button"
      aria-label={`${label} - ${CATEGORIES[node.category]?.label} - ${isFailed ? 'FAILED' : Math.round(loadPct * 100) + '% utilization'}`}
    >
      {/* Critical pulse */}
      {!isFailed && loadPct > 0.85 && (
        <rect x={-w / 2 - 4} y={-h / 2 - 4} width={w + 8} height={h + 8} rx={13} fill="none" stroke="#ef4444" strokeWidth={2}>
          <animate attributeName="opacity" values="0.7;0.15;0.7" dur="1s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Failed pulse */}
      {isFailed && (
        <rect x={-w / 2 - 4} y={-h / 2 - 4} width={w + 8} height={h + 8} rx={13} fill="none" stroke="#ef4444" strokeWidth={2} strokeDasharray="6,4">
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Selection highlight */}
      {isSelected && (
        <rect x={-w / 2 - 3} y={-h / 2 - 3} width={w + 6} height={h + 6} rx={12} fill="none" stroke={catColor} strokeWidth={2} strokeDasharray="6,3" opacity={0.8}>
          <animate attributeName="stroke-dashoffset" values="0;18" dur="1s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Connect source highlight */}
      {isConnectSource && (
        <rect x={-w / 2 - 4} y={-h / 2 - 4} width={w + 8} height={h + 8} rx={13} fill="none" stroke="#22d3ee" strokeWidth={2.5}>
          <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Background card */}
      <rect
        x={-w / 2} y={-h / 2}
        width={w} height={h}
        rx={10}
        fill={isFailed ? 'rgba(239,68,68,0.08)' : (isSelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)')}
        stroke={isFailed ? '#ef4444' : (isSelected ? catColor : 'rgba(255,255,255,0.12)')}
        strokeWidth={isSelected ? 1.5 : 1}
      />

      {/* Category color bar */}
      <rect x={-w / 2} y={-h / 2} width={4} height={h} rx={2} fill={isFailed ? '#ef4444' : catColor} opacity={0.8} />

      {/* Icon */}
      <text x={-w / 2 + 18} y={-h / 2 + 24} fontSize="18" textAnchor="middle">
        {isFailed ? '💥' : catIcon}
      </text>

      {/* Label */}
      <text x={-w / 2 + 32} y={-h / 2 + 22} fill={isFailed ? '#ef4444' : '#fff'} fontSize="11" fontWeight="600" fontFamily="'Inter', system-ui, sans-serif">
        {label.length > 18 ? label.slice(0, 18) + '…' : label}
      </text>

      {/* Description */}
      <text x={-w / 2 + 32} y={-h / 2 + 38} fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="'Inter', system-ui, sans-serif">
        {isFailed ? 'SERVICE DOWN' : (desc.length > 28 ? desc.slice(0, 28) + '…' : desc)}
      </text>

      {/* Load bar background */}
      <rect x={-w / 2 + 10} y={h / 2 - 32} width={w - 20} height={5} rx={2.5} fill="rgba(255,255,255,0.06)" />
      {/* Load bar fill */}
      {hasTraffic && (
        <rect
          x={-w / 2 + 10} y={h / 2 - 32}
          width={Math.max(2, (w - 20) * loadPct)}
          height={5} rx={2.5} fill={loadColor}
          style={{ transition: 'width 0.4s ease, fill 0.4s ease' }}
        />
      )}

      {/* RPS and percentage */}
      <text x={-w / 2 + 10} y={h / 2 - 20} fill={isFailed ? '#ef4444' : (hasTraffic ? loadColor : 'rgba(255,255,255,0.15)')} fontSize="8" fontWeight="600" fontFamily="'JetBrains Mono', monospace">
        {isFailed ? 'FAILED' : (hasTraffic ? `${formatRps(currentRps)} rps` : 'idle')}
      </text>
      <text x={w / 2 - 10} y={h / 2 - 20} fill={isFailed ? '#ef4444' : (hasTraffic ? loadColor : 'rgba(255,255,255,0.15)')} fontSize="8" fontWeight="700" textAnchor="end" fontFamily="'JetBrains Mono', monospace">
        {isFailed ? '✕' : `${Math.round(loadPct * 100)}%`}
      </text>

      {/* Category badge */}
      <rect x={-w / 2 + 12} y={h / 2 - 14} width={w - 24} height={12} rx={3} fill={`${isFailed ? '#ef4444' : catColor}18`} />
      <text x={0} y={h / 2 - 5} fill={isFailed ? '#ef4444' : catColor} fontSize="7" fontWeight="600" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">
        {CATEGORIES[node.category]?.label.toUpperCase()}
      </text>

      {/* Connection anchor points */}
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
});

export default CanvasNode;
