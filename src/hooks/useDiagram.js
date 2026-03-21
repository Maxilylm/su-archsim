import { useState, useCallback, useRef, useEffect } from 'react';
import { getService } from '../data/catalog';
import { validateConnection } from '../data/connections';
import { getDefaultTemplate } from '../data/templates';

const STORAGE_KEY = 'archsim-diagram';
const MAX_HISTORY = 50;

// Try to restore from localStorage, fall back to default template
function buildInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.nodes?.length > 0) {
        const maxId = Math.max(0, ...data.nodes.map(n => parseInt(n.id.split('_')[1]) || 0));
        return { nodes: data.nodes, edges: data.edges || [], maxId: maxId + 1 };
      }
    }
  } catch { /* ignore corrupt storage */ }

  const template = getDefaultTemplate();
  if (!template) return { nodes: [], edges: [], maxId: 1 };
  const data = template.build();
  const maxId = Math.max(0, ...data.nodes.map(n => parseInt(n.id.split('_')[1]) || 0));
  return { ...data, maxId: maxId + 1 };
}

const initialState = buildInitialState();

export default function useDiagram() {
  const [nodes, setNodes] = useState(initialState.nodes);
  const [edges, setEdges] = useState(initialState.edges);
  const [selectedId, setSelectedId] = useState(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectSource, setConnectSource] = useState(null);
  const nodeIdCounterRef = useRef(initialState.maxId);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  // ═══════════ UNDO / REDO ═══════════
  // Undo/redo: refs for data, state for position (triggers re-render for canUndo/canRedo)
  const historyRef = useRef([{ nodes: initialState.nodes, edges: initialState.edges }]);
  const [historyLen, setHistoryLen] = useState(1);
  const [historyPos, setHistoryPos] = useState(0);

  const pushHistoryReal = useCallback((newNodes, newEdges) => {
    const arr = historyRef.current;
    const truncated = arr.slice(0, historyPos + 1);
    truncated.push({ nodes: newNodes, edges: newEdges });
    if (truncated.length > MAX_HISTORY) truncated.shift();
    historyRef.current = truncated;
    const newPos = truncated.length - 1;
    setHistoryLen(truncated.length);
    setHistoryPos(newPos);
  }, [historyPos]);

  const undo = useCallback(() => {
    if (historyPos <= 0) return;
    const newPos = historyPos - 1;
    setHistoryPos(newPos);
    const state = historyRef.current[newPos];
    setNodes(state.nodes);
    setEdges(state.edges);
  }, [historyPos]);

  const redo = useCallback(() => {
    if (historyPos >= historyLen - 1) return;
    const newPos = historyPos + 1;
    setHistoryPos(newPos);
    const state = historyRef.current[newPos];
    setNodes(state.nodes);
    setEdges(state.edges);
  }, [historyPos, historyLen]);

  const canUndo = historyPos > 0;
  const canRedo = historyPos < historyLen - 1;

  // ═══════════ AUTO-SAVE ═══════════
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
      } catch { /* storage full */ }
    }, 500);
  }, [nodes, edges]);

  // ═══════════ TOAST ═══════════
  const showToast = useCallback((msg, type = 'error') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // ═══════════ NODE OPERATIONS ═══════════

  const addNode = useCallback((serviceId, x, y) => {
    const service = getService(serviceId);
    if (!service) return;

    const config = {};
    for (const field of service.configSchema) {
      config[field.key] = field.default;
    }

    const id = `node_${nodeIdCounterRef.current++}`;
    setNodes(prev => {
      const next = [...prev, { id, serviceId, category: service.category, x, y, config }];
      setEdges(curEdges => { pushHistoryReal(next, curEdges); return curEdges; });
      return next;
    });
    setSelectedId(id);
    return id;
  }, [pushHistoryReal]);

  const removeNode = useCallback((nodeId) => {
    setNodes(prev => {
      const next = prev.filter(n => n.id !== nodeId);
      setEdges(curEdges => {
        const nextEdges = curEdges.filter(e => e.source !== nodeId && e.target !== nodeId);
        pushHistoryReal(next, nextEdges);
        return nextEdges;
      });
      return next;
    });
    setSelectedId(prev => prev === nodeId ? null : prev);
    setConnectSource(prev => prev === nodeId ? null : prev);
  }, [pushHistoryReal]);

  const moveNode = useCallback((nodeId, x, y) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x, y } : n));
    // Don't push move to history — too noisy. Push on mouseUp from App.
  }, []);

  const commitMove = useCallback(() => {
    // Called on mouseUp after dragging to save a history checkpoint
    setNodes(cur => { setEdges(curE => { pushHistoryReal(cur, curE); return curE; }); return cur; });
  }, [pushHistoryReal]);

  const updateNodeConfig = useCallback((nodeId, key, value) => {
    setNodes(prev => {
      const next = prev.map(n =>
        n.id === nodeId ? { ...n, config: { ...n.config, [key]: value } } : n
      );
      setEdges(curEdges => { pushHistoryReal(next, curEdges); return curEdges; });
      return next;
    });
  }, [pushHistoryReal]);

  // Duplicate a node (offset by +40, +40)
  const duplicateNode = useCallback((nodeId) => {
    setNodes(prev => {
      const src = prev.find(n => n.id === nodeId);
      if (!src) return prev;
      const id = `node_${nodeIdCounterRef.current++}`;
      const dupe = { ...src, id, x: src.x + 40, y: src.y + 40, config: { ...src.config } };
      const next = [...prev, dupe];
      setEdges(curEdges => { pushHistoryReal(next, curEdges); return curEdges; });
      setSelectedId(id);
      return next;
    });
  }, [pushHistoryReal]);

  // ═══════════ CONNECTIONS ═══════════

  const handleNodeClick = useCallback((nodeId) => {
    if (!connectMode) {
      setSelectedId(nodeId);
      return;
    }

    if (!connectSource) {
      setConnectSource(nodeId);
      showToast('Now click the target component', 'info');
      return;
    }

    if (connectSource === nodeId) {
      setConnectSource(null);
      showToast('Cannot connect a component to itself', 'error');
      return;
    }

    const exists = edges.some(e =>
      (e.source === connectSource && e.target === nodeId) ||
      (e.source === nodeId && e.target === connectSource)
    );
    if (exists) {
      setConnectSource(null);
      showToast('Connection already exists', 'error');
      return;
    }

    const srcNode = nodes.find(n => n.id === connectSource);
    const tgtNode = nodes.find(n => n.id === nodeId);
    if (!srcNode || !tgtNode) {
      setConnectSource(null);
      return;
    }

    const result = validateConnection(
      srcNode.serviceId, tgtNode.serviceId,
      srcNode.category, tgtNode.category
    );

    if (!result.allowed) {
      setConnectSource(null);
      showToast(result.reason, 'error');
      return;
    }

    setEdges(prev => {
      const newEdge = { id: `edge_${connectSource}_${nodeId}`, source: connectSource, target: nodeId };
      const next = [...prev, newEdge];
      setNodes(curNodes => { pushHistoryReal(curNodes, next); return curNodes; });
      return next;
    });
    setConnectSource(null);
    showToast('Connection created', 'success');
  }, [connectMode, connectSource, edges, nodes, showToast, pushHistoryReal]);

  const removeEdge = useCallback((edgeId) => {
    setEdges(prev => {
      const next = prev.filter(e => e.id !== edgeId);
      setNodes(curNodes => { pushHistoryReal(curNodes, next); return curNodes; });
      return next;
    });
  }, [pushHistoryReal]);

  const toggleConnectMode = useCallback(() => {
    setConnectMode(prev => !prev);
    setConnectSource(null);
  }, []);

  // ═══════════ CANVAS OPERATIONS ═══════════

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedId(null);
    setConnectSource(null);
    nodeIdCounterRef.current = 1;
    pushHistoryReal([], []);
  }, [pushHistoryReal]);

  const exportDiagram = useCallback((cloud) => {
    return JSON.stringify({ cloud, nodes, edges }, null, 2);
  }, [nodes, edges]);

  const importDiagram = useCallback((json) => {
    try {
      const data = JSON.parse(json);
      if (data.nodes && data.edges) {
        setNodes(data.nodes);
        setEdges(data.edges);
        const maxId = Math.max(0, ...data.nodes.map(n => parseInt(n.id.split('_')[1]) || 0));
        nodeIdCounterRef.current = maxId + 1;
        setSelectedId(null);
        pushHistoryReal(data.nodes, data.edges);
        showToast('Diagram imported', 'success');
        return data.cloud || null;
      }
    } catch {
      showToast('Invalid diagram JSON', 'error');
    }
    return null;
  }, [showToast, pushHistoryReal]);

  const loadTemplate = useCallback((template) => {
    if (!template) return;
    const data = template.build();
    setNodes(data.nodes);
    setEdges(data.edges);
    const maxId = Math.max(0, ...data.nodes.map(n => parseInt(n.id.split('_')[1]) || 0));
    nodeIdCounterRef.current = maxId + 1;
    setSelectedId(null);
    setConnectSource(null);
    pushHistoryReal(data.nodes, data.edges);
    showToast(`Loaded: ${template.name}`, 'success');
  }, [showToast, pushHistoryReal]);

  const selectedNode = nodes.find(n => n.id === selectedId);

  return {
    nodes, edges, selectedId, selectedNode, connectMode, connectSource, toast,
    addNode, removeNode, moveNode, commitMove, updateNodeConfig, duplicateNode,
    handleNodeClick, removeEdge, toggleConnectMode, setSelectedId,
    clearCanvas, exportDiagram, importDiagram, loadTemplate,
    undo, redo, canUndo, canRedo,
  };
}
