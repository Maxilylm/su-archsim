import { CATEGORIES } from '../data/catalog';
import { getConnectionLabel } from '../data/connections';

export default function CanvasEdge({ edge, sourceNode, targetNode, isSelected, onClick }) {
  if (!sourceNode || !targetNode) return null;

  const x1 = sourceNode.x;
  const y1 = sourceNode.y;
  const x2 = targetNode.x;
  const y2 = targetNode.y;

  const catColor = CATEGORIES[sourceNode.category]?.color || '#888';

  // Calculate control point for a nice curve
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curvature = Math.min(dist * 0.15, 60);

  // Perpendicular offset for curve
  const nx = -dy / dist * curvature;
  const ny = dx / dist * curvature;

  const cx = (x1 + x2) / 2 + nx;
  const cy = (y1 + y2) / 2 + ny;

  const pathD = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;

  // Arrow at endpoint
  const angle = Math.atan2(y2 - cy, x2 - cx);
  const arrowLen = 8;
  const arrowX1 = x2 - arrowLen * Math.cos(angle - 0.4);
  const arrowY1 = y2 - arrowLen * Math.sin(angle - 0.4);
  const arrowX2 = x2 - arrowLen * Math.cos(angle + 0.4);
  const arrowY2 = y2 - arrowLen * Math.sin(angle + 0.4);

  const connLabel = getConnectionLabel(sourceNode.serviceId, targetNode.serviceId);

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Hit area (wider invisible path for easier clicking) */}
      <path d={pathD} fill="none" stroke="transparent" strokeWidth={12} />

      {/* Base path */}
      <path
        d={pathD}
        fill="none"
        stroke={isSelected ? '#22d3ee' : catColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
        opacity={isSelected ? 0.9 : 0.4}
        strokeDasharray={isSelected ? 'none' : 'none'}
      />

      {/* Arrow head */}
      <polygon
        points={`${x2},${y2} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
        fill={isSelected ? '#22d3ee' : catColor}
        opacity={isSelected ? 0.9 : 0.4}
      />

      {/* Animated dot */}
      <circle r={2.5} fill={catColor} opacity={0.7}>
        <animateMotion dur="3s" repeatCount="indefinite" path={pathD} />
      </circle>

      {/* Label on hover / selected */}
      {isSelected && (
        <g transform={`translate(${(x1 + x2) / 2 + nx * 0.3}, ${(y1 + y2) / 2 + ny * 0.3})`}>
          <rect x={-40} y={-10} width={80} height={16} rx={4} fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.15)" />
          <text x={0} y={2} fill="#fff" fontSize="8" fontWeight="500" textAnchor="middle" fontFamily="'Inter', sans-serif">
            {connLabel}
          </text>
        </g>
      )}
    </g>
  );
}
