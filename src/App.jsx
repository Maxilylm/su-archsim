import { useState, useRef, useCallback } from 'react';
import useDiagram from './hooks/useDiagram';
import Palette from './components/Palette';
import CanvasNode from './components/CanvasNode';
import CanvasEdge from './components/CanvasEdge';
import ConfigPanel from './components/ConfigPanel';
import './App.css';

const CLOUDS = {
  aws:   { name: 'AWS',          color: '#FF9900' },
  gcp:   { name: 'Google Cloud', color: '#4285F4' },
  azure: { name: 'Azure',        color: '#0078D4' },
};

const SVG_W = 3000;
const SVG_H = 2000;

export default function App() {
  const [cloud, setCloud] = useState('aws');
  const {
    nodes, edges, selectedId, selectedNode, connectMode, connectSource, toast,
    addNode, removeNode, moveNode, updateNodeConfig, handleNodeClick,
    removeEdge, toggleConnectMode, setSelectedId, clearCanvas, exportDiagram, importDiagram,
  } = useDiagram();

  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1200, h: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const cloudColor = CLOUDS[cloud].color;

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

  // Add service from palette
  const handleAddService = useCallback((serviceId) => {
    // Place in center of current view
    const cx = viewBox.x + viewBox.w / 2 + (Math.random() - 0.5) * 100;
    const cy = viewBox.y + viewBox.h / 2 + (Math.random() - 0.5) * 100;
    addNode(serviceId, cx, cy);
  }, [addNode, viewBox]);

  // Node drag start
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

  // Canvas mouse move (drag node or pan)
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

  // Canvas mouse up
  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
    setIsPanning(false);
    setPanStart(null);
  }, []);

  // Canvas mouse down (start pan)
  const handleCanvasMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.tagName === 'rect' && e.target.classList.contains('canvas-bg')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setSelectedId(null);
      setSelectedEdgeId(null);
    }
  }, [setSelectedId]);

  // Zoom
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

  // Keyboard shortcuts
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
      if (connectMode) toggleConnectMode();
    }
  }, [selectedId, selectedEdgeId, connectMode, removeNode, removeEdge, setSelectedId, toggleConnectMode]);

  // Export/import
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

  return (
    <div className="app" tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Header / Toolbar */}
      <header className="header">
        <div className="header-left">
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
                onClick={() => setCloud(key)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="toolbar-divider" />

          {/* Tools */}
          <button
            className={`tool-btn ${connectMode ? 'active-tool' : ''}`}
            onClick={toggleConnectMode}
            title="Connect components (C)"
          >
            {connectMode ? '🔗 Connecting...' : '🔗 Connect'}
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

        <a href="https://github.com/maxilylm/su-archsim" target="_blank" rel="noopener noreferrer" className="github-link">
          GitHub
        </a>
      </header>

      <div className="main">
        {/* Palette */}
        <Palette cloud={cloud} onAddService={handleAddService} />

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
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); setSelectedEdgeId(null); }}
              />
            ))}

            {/* Empty state */}
            {nodes.length === 0 && (
              <g transform={`translate(${viewBox.x + viewBox.w / 2}, ${viewBox.y + viewBox.h / 2})`}>
                <text fill="rgba(255,255,255,0.15)" fontSize="20" textAnchor="middle" fontWeight="600" y={-10}>
                  Click components in the palette to add them
                </text>
                <text fill="rgba(255,255,255,0.1)" fontSize="13" textAnchor="middle" y={15}>
                  Drag to move • Scroll to zoom • Del to remove
                </text>
              </g>
            )}
          </svg>

          {/* Status bar */}
          <div className="status-bar">
            <span>{nodes.length} component{nodes.length !== 1 ? 's' : ''}</span>
            <span>{edges.length} connection{edges.length !== 1 ? 's' : ''}</span>
            <span>{CLOUDS[cloud].name}</span>
            <span>Zoom: {Math.round(1200 / viewBox.w * 100)}%</span>
            {connectMode && <span className="status-connect">CONNECT MODE</span>}
          </div>
        </div>

        {/* Config Panel */}
        <ConfigPanel
          node={selectedNode}
          cloud={cloud}
          onUpdateConfig={updateNodeConfig}
          onRemove={removeNode}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
