export default function Connection({ x1, y1, x2, y2, load, maxLoad, cloudColor }) {
  const loadPct = Math.min(load / Math.max(maxLoad, 1), 1);
  const opacity = 0.15 + loadPct * 0.6;
  const width = 1 + loadPct * 2.5;

  // Curved path with control points
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // Offset for curve
  const cx = midX - dy * 0.15;
  const cy = midY + dx * 0.15;

  const pathD = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;

  return (
    <g>
      {/* Base line */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={4}
      />
      {/* Active line */}
      <path
        d={pathD}
        fill="none"
        stroke={cloudColor}
        strokeWidth={width}
        opacity={opacity}
        style={{ transition: 'all 0.3s ease' }}
      />
      {/* Animated particle when there's load */}
      {loadPct > 0.05 && (
        <circle r={2 + loadPct * 2} fill={cloudColor} opacity={0.8}>
          <animateMotion
            dur={`${Math.max(0.5, 3 - loadPct * 2.5)}s`}
            repeatCount="indefinite"
            path={pathD}
          />
        </circle>
      )}
    </g>
  );
}
