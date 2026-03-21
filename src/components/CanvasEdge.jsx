import { memo } from 'react';
import { CATEGORIES } from '../data/catalog';
import { getConnectionLabel } from '../data/connections';
import { computeNodeLoad, getLoadColor } from '../data/traffic';

const CanvasEdge = memo(function CanvasEdge({ sourceNode, targetNode, isSelected, showLabel, sliders, isFailed, onClick }) {
  if (!sourceNode || !targetNode) return null;

  const x1 = sourceNode.x;
  const y1 = sourceNode.y;
  const x2 = targetNode.x;
  const y2 = targetNode.y;

  const catColor = CATEGORIES[sourceNode.category]?.color || '#888';

  // Load on this edge = min of source and target load
  const srcLoad = computeNodeLoad(sourceNode.serviceId, sourceNode.category, sliders);
  const tgtLoad = computeNodeLoad(targetNode.serviceId, targetNode.category, sliders);
  const edgeLoad = Math.min(srcLoad, tgtLoad);
  const hasTraffic = edgeLoad > 0.01;

  // Failed mode
  const edgeColor = isFailed ? '#ef4444' : (hasTraffic ? getLoadColor(edgeLoad) : catColor);

  // Curve calculation
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const curvature = Math.min(dist * 0.15, 60);
  const nx = -dy / dist * curvature;
  const ny = dx / dist * curvature;
  const cx = (x1 + x2) / 2 + nx;
  const cy = (y1 + y2) / 2 + ny;
  const pathD = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;

  // Arrow
  const angle = Math.atan2(y2 - cy, x2 - cx);
  const arrowLen = 8;
  const arrowX1 = x2 - arrowLen * Math.cos(angle - 0.4);
  const arrowY1 = y2 - arrowLen * Math.sin(angle - 0.4);
  const arrowX2 = x2 - arrowLen * Math.cos(angle + 0.4);
  const arrowY2 = y2 - arrowLen * Math.sin(angle + 0.4);

  const connLabel = getConnectionLabel(sourceNode.serviceId, targetNode.serviceId);

  // Animation speed
  const animDur = isFailed ? '6s' : (hasTraffic ? `${Math.max(0.4, 3 - edgeLoad * 2.6)}s` : '4s');
  const lineWidth = isFailed ? 1 : (hasTraffic ? 1.5 + edgeLoad * 2 : 1.5);
  const lineOpacity = isFailed ? 0.4 : (hasTraffic ? 0.3 + edgeLoad * 0.5 : 0.25);
  const dotSize = hasTraffic ? 2 + edgeLoad * 3 : 2;

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }} role="button" aria-label={`Connection: ${connLabel}`}>
      {/* Hit area */}
      <path d={pathD} fill="none" stroke="transparent" strokeWidth={14} />

      {/* Base glow */}
      {hasTraffic && edgeLoad > 0.5 && !isFailed && (
        <path d={pathD} fill="none" stroke={edgeColor} strokeWidth={lineWidth + 4} opacity={0.08} style={{ transition: 'all 0.4s ease' }} />
      )}

      {/* Main path */}
      <path
        d={pathD}
        fill="none"
        stroke={isSelected ? '#22d3ee' : edgeColor}
        strokeWidth={isSelected ? 2.5 : lineWidth}
        opacity={isSelected ? 0.9 : lineOpacity}
        strokeDasharray={isFailed ? '8,4' : 'none'}
        style={{ transition: 'all 0.4s ease' }}
      />

      {/* Arrow head */}
      <polygon
        points={`${x2},${y2} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
        fill={isSelected ? '#22d3ee' : edgeColor}
        opacity={isSelected ? 0.9 : lineOpacity}
      />

      {/* Animated particles */}
      {!isFailed && (
        <>
          <circle r={dotSize} fill={edgeColor} opacity={0.8}>
            <animateMotion dur={animDur} repeatCount="indefinite" path={pathD} />
          </circle>
          {hasTraffic && edgeLoad > 0.3 && (
            <circle r={dotSize * 0.7} fill={edgeColor} opacity={0.5}>
              <animateMotion dur={animDur} begin={`${parseFloat(animDur) * 0.5}s`} repeatCount="indefinite" path={pathD} />
            </circle>
          )}
          {hasTraffic && edgeLoad > 0.7 && (
            <circle r={dotSize * 0.5} fill={edgeColor} opacity={0.4}>
              <animateMotion dur={animDur} begin={`${parseFloat(animDur) * 0.25}s`} repeatCount="indefinite" path={pathD} />
            </circle>
          )}
        </>
      )}

      {/* Failed X marker */}
      {isFailed && (
        <g transform={`translate(${(x1 + x2) / 2 + nx * 0.3}, ${(y1 + y2) / 2 + ny * 0.3})`}>
          <circle r={8} fill="rgba(239,68,68,0.9)" />
          <text x={0} y={3.5} fill="#fff" fontSize="10" fontWeight="700" textAnchor="middle">✕</text>
        </g>
      )}

      {/* Label — shown always if showLabel is on, or on selection */}
      {(isSelected || showLabel) && (
        <g transform={`translate(${(x1 + x2) / 2 + nx * 0.3}, ${(y1 + y2) / 2 + ny * 0.3})`}>
          <rect x={-44} y={-10} width={88} height={16} rx={4} fill="rgba(0,0,0,0.9)" stroke="rgba(255,255,255,0.15)" />
          <text x={0} y={2} fill="#fff" fontSize="8" fontWeight="500" textAnchor="middle" fontFamily="'Inter', sans-serif">
            {connLabel}
          </text>
        </g>
      )}
    </g>
  );
});

export default CanvasEdge;
