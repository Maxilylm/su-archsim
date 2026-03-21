import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import useDiagram from './hooks/useDiagram';
import Palette from './components/Palette';
import CanvasNode from './components/CanvasNode';
import CanvasEdge from './components/CanvasEdge';
import ConfigPanel from './components/ConfigPanel';
import TrafficPanel from './components/TrafficPanel';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import Minimap from './components/Minimap';
import LintPanel from './components/LintPanel';
import { TEMPLATES } from './data/templates';
import { estimateNodeCost, formatCost } from './data/pricing';
import './App.css';

const CLOUDS = {
  aws:   { name: 'AWS',          color: '#FF9900' },
  gcp:   { name: 'Google Cloud', color: '#4285F4' },
  azure: { name: 'Azure',        color: '#0078D4' },
};

// Canvas constants
const INITIAL_VIEWBOX = { x: 0, y: 0, w: 1200, h: 800 };
const VIEWBOX_MIN_W = 400;
const VIEWBOX_MAX_W = 4000;
const VIEWBOX_MIN_H = 300;
const VIEWBOX_MAX_H = 3000;
const ZOOM_IN_FACTOR = 0.9;
const ZOOM_OUT_FACTOR = 1.1;
const DRAG_THRESHOLD = 5;
const CANVAS_BG_SIZE = 15000;
const MOBILE_BREAKPOINT = 768;
const GRID_SIZE = 25;

export default function App() {
  const [cloud, setCloud] = useState(() => {
    try { return localStorage.getItem('archsim-cloud') || 'aws'; } catch { /* ignore */ return 'aws'; }
  });
  const {
    nodes, edges, selectedId, selectedNode, connectMode, connectSource, toast,
    addNode, removeNode, moveNode, commitMove, updateNodeConfig, duplicateNode,
    handleNodeClick, removeEdge, toggleConnectMode, setSelectedId,
    clearCanvas, exportDiagram, importDiagram, loadTemplate,
    undo, redo, canUndo, canRedo,
  } = useDiagram();

  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState(INITIAL_VIEWBOX);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sliders, setSliders] = useState({ traffic: 30, throughput: 25, users: 20 });
  const [trafficOpen, setTrafficOpen] = useState(() => window.innerWidth > MOBILE_BREAKPOINT);
  const [showExamples, setShowExamples] = useState(false);

  // Mobile state
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Drag-and-drop from palette
  const [paletteDrag, setPaletteDrag] = useState(null);
  const paletteDragRef = useRef(null);

  // Touch state refs
  const touchStateRef = useRef({ lastDist: 0, isPinching: false });

  // ═══════════ NEW FEATURE STATE ═══════════
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [failedNodes, setFailedNodes] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showLint, setShowLint] = useState(true);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('archsim-theme') || 'dark'; } catch { /* ignore */ return 'dark'; }
  });

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('archsim-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  // Persist cloud selection
  useEffect(() => {
    try { localStorage.setItem('archsim-cloud', cloud); } catch { /* ignore */ }
  }, [cloud]);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Derived
  const showMobileConfig = isMobile && selectedNode && mobileConfigOpen;
  const cloudColor = CLOUDS[cloud].color;

  // O(1) node lookups
  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  // Total cost estimate
  const totalCost = useMemo(() => {
    return nodes.reduce((sum, n) => sum + estimateNodeCost(n.serviceId, n.config, cloud), 0);
  }, [nodes, cloud]);

  // Snap helper
  const snap = useCallback((val) => snapToGrid ? Math.round(val / GRID_SIZE) * GRID_SIZE : val, [snapToGrid]);

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
    paletteDragRef.current = null;
    const cx = snap(viewBox.x + viewBox.w / 2 + (Math.random() - 0.5) * 100);
    const cy = snap(viewBox.y + viewBox.h / 2 + (Math.random() - 0.5) * 100);
    addNode(serviceId, cx, cy);
    if (isMobile) setPaletteOpen(false);
  }, [addNode, viewBox, isMobile, snap]);

  // ═══════════ PALETTE DRAG AND DROP ═══════════

  const handlePaletteDragStart = useCallback((e, serviceId) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    paletteDragRef.current = { serviceId, startX: clientX, startY: clientY, isDragging: false };
  }, []);

  const handlePaletteDragMove = useCallback((e) => {
    if (!paletteDragRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const ref = paletteDragRef.current;

    if (!ref.isDragging) {
      const dist = Math.hypot(clientX - ref.startX, clientY - ref.startY);
      if (dist < DRAG_THRESHOLD) return;
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
      setPaletteDrag(null);
      return;
    }

    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

    const svg = svgRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        const svgCoord = screenToSvg(clientX, clientY);
        addNode(ref.serviceId, snap(svgCoord.x), snap(svgCoord.y));
      }
    }
    setPaletteDrag(null);
  }, [screenToSvg, addNode, snap]);

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
      moveNode(draggingNode, snap(svgCoord.x - dragOffset.x), snap(svgCoord.y - dragOffset.y));
      return;
    }
    if (isPanning && panStart) {
      const rect = svgRef.current.getBoundingClientRect();
      setViewBox(prev => {
        const dx = (e.clientX - panStart.x) / rect.width * prev.w;
        const dy = (e.clientY - panStart.y) / rect.height * prev.h;
        return { ...prev, x: prev.x - dx, y: prev.y - dy };
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [draggingNode, isPanning, panStart, screenToSvg, moveNode, dragOffset, snap]);

  const handleMouseUp = useCallback(() => {
    if (draggingNode) commitMove();
    setDraggingNode(null);
    setIsPanning(false);
    setPanStart(null);
  }, [draggingNode, commitMove]);

  const handleCanvasMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || (e.target.tagName === 'rect' && e.target.classList.contains('canvas-bg'))) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setSelectedId(null);
      setSelectedEdgeId(null);
    }
  }, [setSelectedId]);

  // ═══════════ CANVAS TOUCH HANDLERS ═══════════

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStateRef.current.lastDist = Math.hypot(dx, dy);
      touchStateRef.current.isPinching = true;
      setDraggingNode(null);
      return;
    }

    if (e.touches.length === 1 && !draggingNode) {
      const touch = e.touches[0];
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
    e.preventDefault();

    if (e.touches.length === 2 && touchStateRef.current.isPinching) {
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
          const newW = Math.max(VIEWBOX_MIN_W, Math.min(VIEWBOX_MAX_W, prev.w * scale));
          const newH = Math.max(VIEWBOX_MIN_H, Math.min(VIEWBOX_MAX_H, prev.h * scale));
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

      if (draggingNode) {
        const svgCoord = screenToSvg(touch.clientX, touch.clientY);
        moveNode(draggingNode, snap(svgCoord.x - dragOffset.x), snap(svgCoord.y - dragOffset.y));
        return;
      }

      if (isPanning && panStart) {
        const dx = (touch.clientX - panStart.x) / svgRef.current.getBoundingClientRect().width * viewBox.w;
        const dy = (touch.clientY - panStart.y) / svgRef.current.getBoundingClientRect().height * viewBox.h;
        setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
        setPanStart({ x: touch.clientX, y: touch.clientY });
      }
    }
  }, [draggingNode, isPanning, panStart, viewBox, screenToSvg, moveNode, dragOffset, snap]);

  const handleTouchEnd = useCallback(() => {
    touchStateRef.current.isPinching = false;
    touchStateRef.current.lastDist = 0;
    if (draggingNode) commitMove();
    setDraggingNode(null);
    setIsPanning(false);
    setPanStart(null);
  }, [draggingNode, commitMove]);

  // ═══════════ ZOOM (WHEEL) ═══════════

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? ZOOM_OUT_FACTOR : ZOOM_IN_FACTOR;
    const svgCoord = screenToSvg(e.clientX, e.clientY);

    setViewBox(prev => {
      const newW = Math.max(VIEWBOX_MIN_W, Math.min(VIEWBOX_MAX_W, prev.w * scale));
      const newH = Math.max(VIEWBOX_MIN_H, Math.min(VIEWBOX_MAX_H, prev.h * scale));
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
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    // Undo / Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
      e.preventDefault();
      redo();
      return;
    }
    // Duplicate
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      if (selectedId) duplicateNode(selectedId);
      return;
    }

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
      setShowShortcuts(false);
      setShowSearch(false);
      if (connectMode) toggleConnectMode();
    }
    if (e.key === '?') setShowShortcuts(p => !p);
    if (e.key === 'g' || e.key === 'G') setSnapToGrid(p => !p);
    if (e.key === 'f' || e.key === 'F') {
      if (selectedId) {
        setFailedNodes(prev => {
          const next = new Set(prev);
          if (next.has(selectedId)) next.delete(selectedId); else next.add(selectedId);
          return next;
        });
      }
    }
  }, [selectedId, selectedEdgeId, connectMode, removeNode, removeEdge, setSelectedId, toggleConnectMode, undo, redo, duplicateNode]);

  // ═══════════ SEARCH & PAN ═══════════
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return nodes.filter(n => {
      const sid = n.serviceId.toLowerCase();
      return sid.includes(q) || n.category.includes(q);
    });
  }, [searchQuery, nodes]);

  const panToNode = useCallback((nodeId) => {
    const node = nodeMap.get(nodeId);
    if (node) {
      setViewBox(prev => ({ ...prev, x: node.x - prev.w / 2, y: node.y - prev.h / 2 }));
      setSelectedId(nodeId);
      setShowSearch(false);
      setSearchQuery('');
    }
  }, [nodeMap, setSelectedId]);

  // ═══════════ EXPORT/IMPORT ═══════════

  const handleExport = () => {
    const json = exportDiagram(cloud);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archsim-${cloud}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSvg = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const blob = new Blob([clone.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archsim-${cloud}-${Date.now()}.svg`;
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
        reader.onload = (ev) => {
          const importedCloud = importDiagram(ev.target.result);
          if (importedCloud && CLOUDS[importedCloud]) setCloud(importedCloud);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleLoadTemplate = (template) => {
    loadTemplate(template);
    setShowExamples(false);
    setViewBox(INITIAL_VIEWBOX);
    setFailedNodes(new Set());
  };

  // ═══════════ MINIMAP PAN ═══════════
  const handleMinimapPan = useCallback((x, y) => {
    setViewBox(prev => ({ ...prev, x, y }));
  }, []);

  return (
    <div className={`app ${theme}`} tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Header / Toolbar */}
      <header className="header">
        <div className="header-left">
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

          {/* Examples */}
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
            title="Connect components"
          >
            🔗 Connect
          </button>

          <button
            className="tool-btn"
            onClick={() => { if (selectedId) duplicateNode(selectedId); }}
            disabled={!selectedId}
            title="Duplicate selected (Ctrl+D)"
          >
            📋 Duplicate
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

          {/* Undo/Redo */}
          <button className="tool-btn" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">↩ Undo</button>
          <button className="tool-btn" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">↪ Redo</button>

          <div className="toolbar-divider" />

          {/* Toggles */}
          <button
            className={`tool-btn ${snapToGrid ? 'active-tool' : ''}`}
            onClick={() => setSnapToGrid(p => !p)}
            title="Snap to grid (G)"
          >
            ⊞ Grid
          </button>

          <button
            className={`tool-btn ${showEdgeLabels ? 'active-tool' : ''}`}
            onClick={() => setShowEdgeLabels(p => !p)}
            title="Show all edge labels"
          >
            🏷️ Labels
          </button>

          <button
            className="tool-btn"
            onClick={() => setShowSearch(p => !p)}
            title="Search nodes"
          >
            🔍 Find
          </button>

          <div className="toolbar-divider" />

          <button className="tool-btn" onClick={handleExport} title="Export JSON">📤 Export</button>
          <button className="tool-btn" onClick={handleExportSvg} title="Export SVG image">🖼️ SVG</button>
          <button className="tool-btn" onClick={handleImport} title="Import diagram">📥 Import</button>
          <button className="tool-btn danger" onClick={() => {
            if (nodes.length === 0 || window.confirm('Clear entire canvas? This cannot be undone.')) { clearCanvas(); setFailedNodes(new Set()); }
          }} title="Clear canvas">
            ⚠️ Clear
          </button>

          <div className="toolbar-divider" />

          <button
            className="tool-btn"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button className="tool-btn" onClick={() => setShowShortcuts(true)} title="Keyboard shortcuts (?)">
            ⌨️
          </button>
        </div>

        {/* Mobile toolbar */}
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
          <button className={`tool-btn ${connectMode ? 'active-tool' : ''}`} onClick={toggleConnectMode}>🔗</button>
          <button className="tool-btn" onClick={() => setShowExamples(p => !p)}>📐</button>
          <button className="tool-btn" onClick={undo} disabled={!canUndo}>↩</button>
          <button className="tool-btn" onClick={handleExport}>📤</button>
        </div>

        <a href="https://github.com/maxilylm/su-archsim" target="_blank" rel="noopener noreferrer" className="github-link desktop-only">
          GitHub
        </a>
      </header>

      {/* Search bar */}
      {showSearch && (
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search nodes by service or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.slice(0, 8).map(n => (
                <button key={n.id} className="search-result-item" onClick={() => panToNode(n.id)}>
                  <span>{n.serviceId}</span>
                  <span className="search-result-cat">{n.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="main">
        {/* Palette backdrop */}
        {isMobile && paletteOpen && (
          <div className="palette-backdrop" onClick={() => setPaletteOpen(false)} />
        )}

        {/* Palette */}
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
              {snapToGrid && (
                <pattern id="snap-grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                  <circle cx={GRID_SIZE} cy={GRID_SIZE} r={0.8} fill="rgba(34,211,238,0.15)" />
                </pattern>
              )}
            </defs>

            {/* Background */}
            <rect className="canvas-bg" x={-CANVAS_BG_SIZE / 3} y={-CANVAS_BG_SIZE / 3} width={CANVAS_BG_SIZE} height={CANVAS_BG_SIZE} fill="var(--canvas-bg, #0a0a0f)" />
            <rect x={-CANVAS_BG_SIZE / 3} y={-CANVAS_BG_SIZE / 3} width={CANVAS_BG_SIZE} height={CANVAS_BG_SIZE} fill="url(#grid)" />
            <rect x={-CANVAS_BG_SIZE / 3} y={-CANVAS_BG_SIZE / 3} width={CANVAS_BG_SIZE} height={CANVAS_BG_SIZE} fill="url(#grid-large)" />
            {snapToGrid && (
              <rect x={-CANVAS_BG_SIZE / 3} y={-CANVAS_BG_SIZE / 3} width={CANVAS_BG_SIZE} height={CANVAS_BG_SIZE} fill="url(#snap-grid)" />
            )}

            {/* Edges */}
            {edges.map(edge => {
              const srcNode = nodeMap.get(edge.source);
              const tgtNode = nodeMap.get(edge.target);
              return (
                <CanvasEdge
                  key={edge.id}
                  edge={edge}
                  sourceNode={srcNode}
                  targetNode={tgtNode}
                  isSelected={selectedEdgeId === edge.id}
                  showLabel={showEdgeLabels}
                  sliders={sliders}
                  isFailed={failedNodes.has(edge.source) || failedNodes.has(edge.target)}
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
                isFailed={failedNodes.has(node.id)}
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
            <span className="status-cost" title="Estimated monthly cost">{formatCost(totalCost)}/mo</span>
            <span className="desktop-only">Zoom: {Math.round(INITIAL_VIEWBOX.w / viewBox.w * 100)}%</span>
            {snapToGrid && <span className="status-snap">GRID</span>}
            {failedNodes.size > 0 && <span className="status-fail">CHAOS: {failedNodes.size}</span>}
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

          {/* Minimap */}
          {nodes.length > 0 && (
            <Minimap nodes={nodes} viewBox={viewBox} onPan={handleMinimapPan} />
          )}

          {/* Lint panel */}
          {showLint && nodes.length >= 2 && (
            <LintPanel
              nodes={nodes}
              edges={edges}
              onSelectNode={(id) => { panToNode(id); setShowLint(true); }}
            />
          )}
        </div>

        {/* Config Panel - desktop */}
        <div className="config-panel-desktop">
          <ConfigPanel
            node={selectedNode}
            cloud={cloud}
            sliders={sliders}
            onUpdateConfig={updateNodeConfig}
            onRemove={removeNode}
            onDuplicate={duplicateNode}
            isFailed={selectedId ? failedNodes.has(selectedId) : false}
            onToggleFail={(id) => {
              setFailedNodes(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id); else next.add(id);
                return next;
              });
            }}
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
                onDuplicate={duplicateNode}
                isFailed={selectedId ? failedNodes.has(selectedId) : false}
                onToggleFail={(id) => {
                  setFailedNodes(prev => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id); else next.add(id);
                    return next;
                  });
                }}
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

      {/* Keyboard shortcuts modal */}
      {showShortcuts && <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
