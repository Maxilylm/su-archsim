import { memo, useMemo } from 'react';
import { CATEGORIES } from '../data/catalog';

const MINIMAP_W = 160;
const MINIMAP_H = 100;

const Minimap = memo(function Minimap({ nodes, viewBox, onPan }) {
  // Compute bounding box of all nodes with padding
  const bounds = useMemo(() => {
    if (nodes.length === 0) return { x: 0, y: 0, w: 1200, h: 800 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
    }
    const pad = 200;
    return { x: minX - pad, y: minY - pad, w: Math.max(maxX - minX + pad * 2, 400), h: Math.max(maxY - minY + pad * 2, 300) };
  }, [nodes]);

  const scale = Math.min(MINIMAP_W / bounds.w, MINIMAP_H / bounds.h);

  // Viewport rect in minimap space
  const vpx = (viewBox.x - bounds.x) * scale;
  const vpy = (viewBox.y - bounds.y) * scale;
  const vpw = viewBox.w * scale;
  const vph = viewBox.h * scale;

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width * bounds.w + bounds.x;
    const my = (e.clientY - rect.top) / rect.height * bounds.h + bounds.y;
    onPan(mx - viewBox.w / 2, my - viewBox.h / 2);
  };

  return (
    <div className="minimap" onClick={handleClick}>
      <svg width={MINIMAP_W} height={MINIMAP_H} viewBox={`0 0 ${MINIMAP_W} ${MINIMAP_H}`}>
        <rect width={MINIMAP_W} height={MINIMAP_H} fill="rgba(10,10,15,0.85)" rx={4} />
        {nodes.map(n => (
          <rect
            key={n.id}
            x={(n.x - bounds.x) * scale - 2}
            y={(n.y - bounds.y) * scale - 1.5}
            width={4}
            height={3}
            rx={1}
            fill={CATEGORIES[n.category]?.color || '#888'}
            opacity={0.8}
          />
        ))}
        <rect
          x={vpx} y={vpy} width={vpw} height={vph}
          fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1} rx={1}
        />
      </svg>
    </div>
  );
});

export default Minimap;
