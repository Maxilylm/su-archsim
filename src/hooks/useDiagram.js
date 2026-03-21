import { useState, useCallback, useRef } from 'react';
import { getService } from '../data/catalog';
import { validateConnection } from '../data/connections';
import { getDefaultTemplate } from '../data/templates';

// Build the default diagram on first load
function buildInitialState() {
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

  const showToast = useCallback((msg, type = 'error') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // Add a new node to the canvas
  const addNode = useCallback((serviceId, x, y) => {
    const service = getService(serviceId);
    if (!service) return;

    // Build default config from schema
    const config = {};
    for (const field of service.configSchema) {
      config[field.key] = field.default;
    }

    const id = `node_${nodeIdCounterRef.current++}`;
    setNodes(prev => [...prev, {
      id,
      serviceId,
      category: service.category,
      x,
      y,
      config,
    }]);
    setSelectedId(id);
    return id;
  }, []);

  // Remove a node and its edges
  const removeNode = useCallback((nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedId(prev => prev === nodeId ? null : prev);
    setConnectSource(prev => prev === nodeId ? null : prev);
  }, []);

  // Move a node
  const moveNode = useCallback((nodeId, x, y) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x, y } : n));
  }, []);

  // Update node config
  const updateNodeConfig = useCallback((nodeId, key, value) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId
        ? { ...n, config: { ...n.config, [key]: value } }
        : n
    ));
  }, []);

  // Handle node click (select or connect)
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

    // Check if edge already exists
    const exists = edges.some(e =>
      (e.source === connectSource && e.target === nodeId) ||
      (e.source === nodeId && e.target === connectSource)
    );
    if (exists) {
      setConnectSource(null);
      showToast('Connection already exists', 'error');
      return;
    }

    // Validate connection
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

    // Add edge
    setEdges(prev => [...prev, {
      id: `edge_${connectSource}_${nodeId}`,
      source: connectSource,
      target: nodeId,
    }]);
    setConnectSource(null);
    showToast('Connection created', 'success');
  }, [connectMode, connectSource, edges, nodes, showToast]);

  // Remove an edge
  const removeEdge = useCallback((edgeId) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
  }, []);

  // Toggle connect mode
  const toggleConnectMode = useCallback(() => {
    setConnectMode(prev => !prev);
    setConnectSource(null);
  }, []);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedId(null);
    setConnectSource(null);
    nodeIdCounterRef.current = 1;
  }, []);

  // Export diagram as JSON (cloud is passed in by caller)
  const exportDiagram = useCallback((cloud) => {
    return JSON.stringify({ cloud, nodes, edges }, null, 2);
  }, [nodes, edges]);

  // Import diagram from JSON — returns cloud provider if present
  const importDiagram = useCallback((json) => {
    try {
      const data = JSON.parse(json);
      if (data.nodes && data.edges) {
        setNodes(data.nodes);
        setEdges(data.edges);
        const maxId = Math.max(0, ...data.nodes.map(n => parseInt(n.id.split('_')[1]) || 0));
        nodeIdCounterRef.current = maxId + 1;
        setSelectedId(null);
        showToast('Diagram imported', 'success');
        return data.cloud || null;
      }
    } catch {
      showToast('Invalid diagram JSON', 'error');
    }
    return null;
  }, [showToast]);

  // Load a template (replaces current diagram)
  const loadTemplate = useCallback((template) => {
    if (!template) return;
    const data = template.build();
    setNodes(data.nodes);
    setEdges(data.edges);
    const maxId = Math.max(0, ...data.nodes.map(n => parseInt(n.id.split('_')[1]) || 0));
    nodeIdCounterRef.current = maxId + 1;
    setSelectedId(null);
    setConnectSource(null);
    showToast(`Loaded: ${template.name}`, 'success');
  }, [showToast]);

  const selectedNode = nodes.find(n => n.id === selectedId);

  return {
    nodes,
    edges,
    selectedId,
    selectedNode,
    connectMode,
    connectSource,
    toast,
    addNode,
    removeNode,
    moveNode,
    updateNodeConfig,
    handleNodeClick,
    removeEdge,
    toggleConnectMode,
    setSelectedId,
    clearCanvas,
    exportDiagram,
    importDiagram,
    loadTemplate,
  };
}
