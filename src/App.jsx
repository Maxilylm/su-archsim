import { useState, useRef, useCallback, useEffect } from 'react';
import useDiagram from './hooks/useDiagram';
import Palette from './components/Palette';
import CanvasNode from './components/CanvasNode';
import CanvasEdge from './components/CanvasEdge';
import ConfigPanel from './components/ConfigPanel';
import TrafficPanel from './components/TrafficPanel';
import { TEMPLATES } from './data/templates';
import './App.css';

const CLOUDS = {
  aws:   { name: 'AWS',          color: '#FF9900' },
  gcp:   { name: 'Google Cloud', color: '#4285F4' },
  azure: { name: 'Azure',        color: '#0078D4' },
};

export default function App() {
  const [cloud, setCloud] = useState('aws');
  const {
    nodes, edges, selectedId, selectedNode, connectMode, connectSource, toast,
    addNode, removeNode, moveNode, updateNodeConfig, handleNodeClick,
    removeEdge, toggleConnectMode, setSelectedId, clearCanvas, exportDiagram, importDiagram,
    loadTemplate,
  } = useDiagram();

  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1200, h: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sliders, setSliders] = useState({ traffic: 30, throughput: 25, users: 20 });
  const [trafficOpen, setTrafficOpen] = useState(() => window.innerWidth > 768);
  const [showExamples, setShowExamples] = useState(false);

  // Mobile state
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Drag-and-drop from palette
  const [paletteDrag, setPaletteDrag] = useState(null); // { serviceId, x, y } screen coords
  const paletteDragRef = useRef(null);

  // Touch state refs (avoid stale closure issues)
  const touchStateRef = useRef({ lastDist: 0, isPinching: false });

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Derived: auto-manage mobile config visibility
  const showMobileConfig = isMobile && selectedNode && mobileConfigOpen;

  const cloudColor = CLOUDS[cloud].color;

  const handleCloudSwitch = useCallback((newCloud) => {
    setCloud(newCloud);
  }, []);

  // Convert screen coords to SVG coords
  const screenToSvg = useCallback((screenX, screenY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: viewBox.x + (screenX - rect.left) / rect.width * viewBox.w,
      y: viewBox.y + (screenY - rect.top) / rect.height * viewBox.h,
    };
  }, [viewBox]);

  // Add service from palette (click)
  const handleAddService = useCallback((serviceId) => {
    // Clear any pending drag ref so the global listener effect doesn't pick up stale state
    paletteDragRef.current = null;
    const cx = viewBox.x + viewBox.w / 2 + (Math.random() - 0.5) * 100;
    const cy = viewBox.y + viewBox.h / 2 + (Math.random() - 0.5) * 100;
    addNode(serviceId, cx, cy);
    if (isMobile) setPaletteOpen(false);
  }, [addNode, viewBox, isMobile]);

  // ═══════════ PALETTE DRAG AND DROP ═══════════

  const handlePaletteDragStart = useCallback((e, serviceId) => {
    // Only start drag on mouse (not click) - we detect drag after a small move
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    paletteDragRef.current = { serviceId, startX: clientX, startY: clientY, isDragging: false };
  }, []);

  const handlePaletteDragMove = useCallback((e) => {
    if (!paletteDragRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const ref = paletteDragRef.current;

    // Start drag after 5px threshold
    if (!ref.isDragging) {
      const dist = Math.hypot(clientX - ref.startX, clientY - ref.startY);
      if (dist < 5) return;
      ref.isDragging = true;
    }

    e.preventDefault();
    setPaletteDrag({ serviceId: ref.serviceId, x: clientX, y: clientY });
  }, []);

  const handlePaletteDragEnd = useCallback((e) => {
    if (!paletteDragRef.current) return;
    const ref = paletteDragRef.current;
    paletteDragRef.current = null;

    if (!ref.isDragging) {
      // It was just a click, not a drag
      setPaletteDrag(null);
      return;
    }

    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

    // Check if dropped over canvas
    const svg = svgRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        const svgCoord = screenToSvg(clientX, clientY);
        addNode(ref.serviceId, svgCoord.x, svgCoord.y);
      }
    }
    setPaletteDrag(null);
  }, [screenToSvg, addNode]);

  // Global drag listeners for palette drag – always registered so they can
  // catch mouseup/touchend even when the drag ref was set mid-render-cycle.
  useEffect(() => {
    const move = (e) => handlePaletteDragMove(e);
    const end = (e) => handlePaletteDragEnd(e);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
    };
  }, [handlePaletteDragMove, handlePaletteDragEnd]);

  // ═══════════ NODE DRAG (MOUSE) ═══════════

  const handleNodeMouseDown = useCallback((e, nodeId) => {
    if (connectMode) return;
    e.stopPropagation();
    const svgCoord = screenToSvg(e.clientX, e.clientY);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDraggingNode(nodeId);
      setDragOffset({ x: svgCoord.x - node.x, y: svgCoord.y - node.y });
    }
  }, [connectMode, screenToSvg, nodes]);

  // ═══════════ NODE DRAG (TOUCH) ═══════════

  const handleNodeTouchStart = useCallback((e, nodeId) => {
    if (connectMode) return;
    if (e.touches.length !== 1) return;
    e.stopPropagation();
    const touch = e.touches[0];
    const svgCoord = screenToSvg(touch.clientX, touch.clientY);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDraggingNode(nodeId);
      setDragOffset({ x: svgCoord.x - node.x, y: svgCoord.y - node.y });
    }
  }, [connectMode, screenToSvg, nodes]);

  // ═══════════ CANVAS MOUSE HANDLERS ═══════════

  const handleMouseMove = useCallback((e) => {
    if (draggingNode) {
      const svgCoord = screenToSvg(e.clientX, e.clientY);
      moveNode(draggingNode, svgCoord.x - dragOffset.x, svgCoord.y - dragOffset.y);
      return;
    }
    if (isPanning && panStart) {
      const dx = (e.clientX - panStart.x) / svgRef.current.getBoundingClientRect().width * viewBox.w;
      const dy = (e.clientY - panStart.y) / svgRef.current.getBoundingClientRect().height * viewBox.h;
      setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [draggingNode, isPanning, panStart, viewBox, screenToSvg, moveNode, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
    setIsPanning(false);
    setPanStart(null);
  }, []);

  const handleCanvasMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.tagName === 'rect' && e.target.classList.contains('canvas-bg')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setSelectedId(null);
      setSelectedEdgeId(null);
    }
  }, [setSelectedId]);

  // ═══════════ CANVAS TOUCH HANDLERS ═══════════

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      // Pinch-to-zoom start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStateRef.current.lastDist = Math.hypot(dx, dy);
      touchStateRef.current.isPinching = true;
      setDraggingNode(null);
      return;
    }

    if (e.touches.length === 1 && !draggingNode) {
      // Single finger pan on background
      const touch = e.touches[0];
      // Check if touching canvas background
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const isCanvasBg = target === svgRef.current ||
        (target?.tagName === 'rect' && target?.classList?.contains('canvas-bg')) ||
        target?.closest?.('.canvas-svg') === svgRef.current;

      if (isCanvasBg) {
        setIsPanning(true);
        setPanStart({ x: touch.clientX, y: touch.clientY });
        setSelectedId(null);
        setSelectedEdgeId(null);
      }
    }
  }, [draggingNode, setSelectedId]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault(); // Prevent page scroll while on canvas

    if (e.touches.length === 2 && touchStateRef.current.isPinching) {
      // Pinch-to-zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const prevDist = touchStateRef.current.lastDist;
      if (prevDist > 0) {
        const scale = prevDist / dist;
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const svgCoord = screenToSvg(midX, midY);

        setViewBox(prev => {
          const newW = Math.max(400, Math.min(4000, prev.w * scale));
          const newH = Math.max(300, Math.min(3000, prev.h * scale));
          const ratio = newW / prev.w;
          return {
            x: svgCoord.x - (svgCoord.x - prev.x) * ratio,
            y: svgCoord.y - (svgCoord.y - prev.y) * ratio,
            w: newW,
            h: newH,
          };
        });
      }
      touchStateRef.current.lastDist = dist;
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];

      // Node dragging
      if (draggingNode) {
        const svgCoord = screenToSvg(touch.clientX, touch.clientY);
        moveNode(draggingNode, svgCoord.x - dragOffset.x, svgCoord.y - dragOffset.y);
        return;
      }

      // Canvas panning
      if (isPanning && panStart) {
        const dx = (touch.clientX - panStart.x) / svgRef.current.getBoundingClientRect().width * viewBox.w;
        const dy = (touch.clientY - panStart.y) / svgRef.current.getBoundingClientRect().height * viewBox.h;
        setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
        setPanStart({ x: touch.clientX, y: touch.clientY });
      }
    }
  }, [draggingNode, isPanning, panStart, viewBox, screenToSvg, moveNode, dragOffset]);

  const handleTouchEnd = useCallback(() => {
    touchStateRef.current.isPinching = false;
    touchStateRef.current.lastDist = 0;
    setDraggingNode(null);
    setIsPanning(false);
    setPanStart(null);
  }, []);

  // ═══════════ ZOOM (WHEEL) ═══════════

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 1.1 : 0.9;
    const svgCoord = screenToSvg(e.clientX, e.clientY);

    setViewBox(prev => {
      const newW = Math.max(400, Math.min(4000, prev.w * scale));
      const newH = Math.max(300, Math.min(3000, prev.h * scale));
      const ratio = newW / prev.w;
      return {
        x: svgCoord.x - (svgCoord.x - prev.x) * ratio,
        y: svgCoord.y - (svgCoord.y - prev.y) * ratio,
        w: newW,
        h: newH,
      };
    });
  }, [screenToSvg]);

  // ═══════════ KEYBOARD ═══════════

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedId) {
        removeNode(selectedId);
      } else if (selectedEdgeId) {
        removeEdge(selectedEdgeId);
        setSelectedEdgeId(null);
      }
    }
    if (e.key === 'Escape') {
      setSelectedId(null);
      setSelectedEdgeId(null);
      setShowExamples(false);
      setMobileConfigOpen(false);
      if (connectMode) toggleConnectMode();
    }
  }, [selectedId, selectedEdgeId, connectMode, removeNode, removeEdge, setSelectedId, toggleConnectMode]);

  // ═══════════ EXPORT/IMPORT ═══════════

  const handleExport = () => {
    const json = exportDiagram();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archsim-${cloud}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => importDiagram(ev.target.result);
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleLoadTemplate = (template) => {
    loadTemplate(template);
    setShowExamples(false);
    setViewBox({ x: 0, y: 0, w: 1200, h: 800 });
  };

  return (
    <div className="app" tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Header / Toolbar */}
      <header className="header">
        <div className="header-left">
          {/* Mobile palette toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setPaletteOpen(p => !p)}
            aria-label="Toggle palette"
          >
            ☰
          </button>
          <h1>
            <span style={{ color: cloudColor }}>Arch</span>Sim
            <sup className="tm">TM</sup>
          </h1>
        </div>

        <div className="toolbar">
          {/* Cloud selector */}
          <div className="toolbar-group">
            {Object.entries(CLOUDS).map(([key, c]) => (
              <button
                key={key}
                className={`tool-btn cloud-btn ${cloud === key ? 'active' : ''}`}
                style={{
                  borderColor: cloud === key ? c.color : undefined,
                  color: cloud === key ? c.color : undefined,
                  background: cloud === key ? `${c.color}15` : undefined,
                }}
                onClick={() => handleCloudSwitch(key)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="toolbar-divider" />

          {/* Examples button */}
          <div className="toolbar-examples-wrapper">
            <button
              className={`tool-btn ${showExamples ? 'active-tool' : ''}`}
              onClick={() => setShowExamples(p => !p)}
              title="Load architecture examples"
            >
              📐 Examples
            </button>

            {showExamples && (
              <div className="examples-dropdown">
                <div className="examples-header">
                  <h4>Architecture Examples</h4>
                  <p>Load a pre-built architecture pattern</p>
                </div>
                <div className="examples-list">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      className="example-item"
                      onClick={() => handleLoadTemplate(t)}
                    >
                      <span className="example-icon">{t.icon}</span>
                      <div className="example-info">
                        <span className="example-name">{t.name}</span>
                        <span className="example-desc">{t.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="toolbar-divider" />

          {/* Tools */}
          <button
            className={`tool-btn ${connectMode ? 'active-tool' : ''}`}
            onClick={toggleConnectMode}
            title="Connect components (C)"
          >
            🔗 Connect
          </button>

          <button
            className="tool-btn"
            onClick={() => {
              if (selectedId) removeNode(selectedId);
              else if (selectedEdgeId) { removeEdge(selectedEdgeId); setSelectedEdgeId(null); }
            }}
            disabled={!selectedId && !selectedEdgeId}
            title="Delete selected (Del)"
          >
            🗑️ Delete
          </button>

          <div className="toolbar-divider" />

          <button className="tool-btn" onClick={handleExport} title="Export diagram">
            📤 Export
          </button>
          <button className="tool-btn" onClick={handleImport} title="Import diagram">
            📥 Import
          </button>
          <button className="tool-btn danger" onClick={clearCanvas} title="Clear canvas">
            ⚠️ Clear
          </button>
        </div>

        {/* Mobile toolbar buttons */}
        <div className="mobile-toolbar">
          <div className="toolbar-group">
            {Object.entries(CLOUDS).map(([key, c]) => (
              <button
                key={key}
                className={`tool-btn cloud-btn ${cloud === key ? 'active' : ''}`}
                style={{
                  borderColor: cloud === key ? c.color : undefined,
                  color: cloud === key ? c.color : undefined,
                  background: cloud === key ? `${c.color}15` : undefined,
                }}
                onClick={() => handleCloudSwitch(key)}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            className={`tool-btn ${connectMode ? 'active-tool' : ''}`}
            onClick={toggleConnectMode}
          >
            🔗
          </button>
          <button
            className="tool-btn"
            onClick={() => setShowExamples(p => !p)}
          >
            📐
          </button>
          <button className="tool-btn" onClick={handleExport}>📤</button>
        </div>

        <a href="https://github.com/maxilylm/su-archsim" target="_blank" rel="noopener noreferrer" className="github-link desktop-only">
          GitHub
        </a>
      </header>

      <div className="main">
        {/* Palette backdrop - must be outside palette-wrapper to avoid transform containing block */}
        {isMobile && paletteOpen && (
          <div className="palette-backdrop" onClick={() => setPaletteOpen(false)} />
        )}

        {/* Palette - on mobile, overlay */}
        <div className={`palette-wrapper ${paletteOpen ? 'open' : ''}`}>
          <Palette
            cloud={cloud}
            onAddService={handleAddService}
            onDragStart={handlePaletteDragStart}
          />
        </div>

        {/* Canvas */}
        <div className="canvas-container">
          <svg
            ref={svgRef}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            className="canvas-svg"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              </pattern>
              <pattern id="grid-large" width="250" height="250" patternUnits="userSpaceOnUse">
                <path d="M 250 0 L 0 0 0 250" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Background */}
            <rect className="canvas-bg" x={-5000} y={-5000} width={15000} height={15000} fill="#0a0a0f" />
            <rect x={-5000} y={-5000} width={15000} height={15000} fill="url(#grid)" />
            <rect x={-5000} y={-5000} width={15000} height={15000} fill="url(#grid-large)" />

            {/* Edges */}
            {edges.map(edge => {
              const srcNode = nodes.find(n => n.id === edge.source);
              const tgtNode = nodes.find(n => n.id === edge.target);
              return (
                <CanvasEdge
                  key={edge.id}
                  edge={edge}
                  sourceNode={srcNode}
                  targetNode={tgtNode}
                  isSelected={selectedEdgeId === edge.id}
                  sliders={sliders}
                  onClick={(e) => { e.stopPropagation(); setSelectedEdgeId(edge.id); setSelectedId(null); }}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => (
              <CanvasNode
                key={node.id}
                node={node}
                cloud={cloud}
                isSelected={selectedId === node.id}
                isConnectSource={connectSource === node.id}
                connectMode={connectMode}
                sliders={sliders}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onTouchStart={(e) => handleNodeTouchStart(e, node.id)}
                onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); setSelectedEdgeId(null); if (isMobile) setMobileConfigOpen(true); }}
              />
            ))}

            {/* Empty state */}
            {nodes.length === 0 && (
              <g transform={`translate(${viewBox.x + viewBox.w / 2}, ${viewBox.y + viewBox.h / 2})`}>
                <text fill="rgba(255,255,255,0.15)" fontSize="20" textAnchor="middle" fontWeight="600" y={-10}>
                  {isMobile ? 'Tap components to add them' : 'Drag components from palette to canvas'}
                </text>
                <text fill="rgba(255,255,255,0.1)" fontSize="13" textAnchor="middle" y={15}>
                  {isMobile ? 'Or tap Examples above' : 'Or load an example from the toolbar above'}
                </text>
              </g>
            )}
          </svg>

          {/* Status bar */}
          <div className="status-bar">
            <span>{nodes.length} component{nodes.length !== 1 ? 's' : ''}</span>
            <span>{edges.length} connection{edges.length !== 1 ? 's' : ''}</span>
            <span>{CLOUDS[cloud].name}</span>
            <span className="desktop-only">Zoom: {Math.round(1200 / viewBox.w * 100)}%</span>
            {connectMode && <span className="status-connect">CONNECT MODE</span>}
          </div>

          {/* Traffic panel */}
          <TrafficPanel
            sliders={sliders}
            setSliders={setSliders}
            open={trafficOpen}
            onToggle={() => setTrafficOpen(p => !p)}
            cloudColor={cloudColor}
          />
        </div>

        {/* Config Panel - desktop */}
        <div className="config-panel-desktop">
          <ConfigPanel
            node={selectedNode}
            cloud={cloud}
            sliders={sliders}
            onUpdateConfig={updateNodeConfig}
            onRemove={removeNode}
          />
        </div>
      </div>

      {/* Mobile config bottom sheet */}
      {isMobile && selectedNode && (
        <div className={`mobile-config-sheet ${showMobileConfig ? 'open' : ''}`}>
          <div className="mobile-config-handle" onClick={() => setMobileConfigOpen(p => !p)}>
            <div className="mobile-config-bar" />
          </div>
          {showMobileConfig && (
            <div className="mobile-config-body">
              <ConfigPanel
                node={selectedNode}
                cloud={cloud}
                sliders={sliders}
                onUpdateConfig={updateNodeConfig}
                onRemove={(id) => { removeNode(id); setMobileConfigOpen(false); }}
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile FAB for delete */}
      {isMobile && (selectedId || selectedEdgeId) && (
        <button
          className="mobile-fab-delete"
          onClick={() => {
            if (selectedId) removeNode(selectedId);
            else if (selectedEdgeId) { removeEdge(selectedEdgeId); setSelectedEdgeId(null); }
          }}
        >
          🗑️
        </button>
      )}

      {/* Palette drag ghost */}
      {paletteDrag && (
        <div
          className="palette-drag-ghost"
          style={{ left: paletteDrag.x - 30, top: paletteDrag.y - 20 }}
        >
          +
        </div>
      )}

      {/* Examples overlay backdrop */}
      {showExamples && (
        <div className="examples-backdrop" onClick={() => setShowExamples(false)} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
