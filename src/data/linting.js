// Architecture linting rules
// Detects common anti-patterns and suggests improvements

/**
 * Run all lint rules against the current diagram
 * @returns {Array<{severity: 'error'|'warning'|'info', message: string, nodeIds: string[]}>}
 */
export function lintArchitecture(nodes, edges) {
  const warnings = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Build adjacency
  const incomingEdges = new Map(); // nodeId -> [sourceNodeId]
  const outgoingEdges = new Map(); // nodeId -> [targetNodeId]
  for (const e of edges) {
    if (!incomingEdges.has(e.target)) incomingEdges.set(e.target, []);
    incomingEdges.get(e.target).push(e.source);
    if (!outgoingEdges.has(e.source)) outgoingEdges.set(e.source, []);
    outgoingEdges.get(e.source).push(e.target);
  }

  // Rule 1: Database exposed to internet (no ALB/API GW/WAF in front)
  const dbServices = new Set(['rds', 'aurora', 'dynamodb', 'elasticache', 'redshift', 'neptune']);
  const frontendServices = new Set(['alb', 'nlb', 'api_gateway', 'cdn', 'waf']);
  for (const node of nodes) {
    if (dbServices.has(node.serviceId)) {
      const incoming = incomingEdges.get(node.id) || [];
      const hasCompute = incoming.some(srcId => {
        const src = nodeMap.get(srcId);
        return src && (src.category === 'compute' || src.category === 'containers' || src.category === 'serverless');
      });
      if (!hasCompute && incoming.length > 0) {
        // Check if any incoming is a frontend service directly
        const directFrontend = incoming.some(srcId => {
          const src = nodeMap.get(srcId);
          return src && frontendServices.has(src.serviceId);
        });
        if (directFrontend) {
          warnings.push({
            severity: 'error',
            message: `Database directly exposed via load balancer/API — add a compute layer`,
            nodeIds: [node.id],
          });
        }
      }
    }
  }

  // Rule 2: Public-facing ALB without WAF
  for (const node of nodes) {
    if (node.serviceId === 'alb' || node.serviceId === 'api_gateway') {
      const incoming = incomingEdges.get(node.id) || [];
      const hasWaf = incoming.some(srcId => nodeMap.get(srcId)?.serviceId === 'waf');
      const hasFrontend = incoming.some(srcId => {
        const src = nodeMap.get(srcId);
        return src && (src.serviceId === 'cdn' || src.serviceId === 'dns');
      });
      if (hasFrontend && !hasWaf) {
        warnings.push({
          severity: 'warning',
          message: `Public-facing ${node.serviceId === 'alb' ? 'ALB' : 'API Gateway'} without WAF protection`,
          nodeIds: [node.id],
        });
      }
    }
  }

  // Rule 3: Single point of failure — compute with no redundancy
  for (const node of nodes) {
    if (node.serviceId === 'ec2' && (!node.config?.count || node.config.count < 2)) {
      const incoming = incomingEdges.get(node.id) || [];
      if (incoming.length > 0) {
        warnings.push({
          severity: 'warning',
          message: `Single EC2 instance is a single point of failure — add count >= 2 or Auto Scaling`,
          nodeIds: [node.id],
        });
      }
    }
  }

  // Rule 4: RDS without Multi-AZ
  for (const node of nodes) {
    if ((node.serviceId === 'rds' || node.serviceId === 'aurora') && !node.config?.multiAz) {
      warnings.push({
        severity: 'warning',
        message: `${node.serviceId === 'rds' ? 'RDS' : 'Aurora'} without Multi-AZ — risks downtime during failures`,
        nodeIds: [node.id],
      });
    }
  }

  // Rule 5: No monitoring
  const hasMonitoring = nodes.some(n => n.category === 'monitoring');
  if (nodes.length >= 3 && !hasMonitoring) {
    warnings.push({
      severity: 'info',
      message: 'No monitoring service — consider adding CloudWatch or X-Ray',
      nodeIds: [],
    });
  }

  // Rule 6: Static assets served without CDN
  for (const node of nodes) {
    if (node.serviceId === 's3') {
      const incoming = incomingEdges.get(node.id) || [];
      const hasCdn = incoming.some(srcId => nodeMap.get(srcId)?.serviceId === 'cdn');
      const hasPublicAccess = incoming.some(srcId => {
        const src = nodeMap.get(srcId);
        return src && (src.serviceId === 'dns' || src.serviceId === 'alb');
      });
      if (hasPublicAccess && !hasCdn) {
        warnings.push({
          severity: 'info',
          message: 'S3 served directly — consider adding a CDN for better performance',
          nodeIds: [node.id],
        });
      }
    }
  }

  // Rule 7: Orphan nodes (no connections)
  for (const node of nodes) {
    const hasIn = (incomingEdges.get(node.id) || []).length > 0;
    const hasOut = (outgoingEdges.get(node.id) || []).length > 0;
    if (!hasIn && !hasOut && nodes.length > 1) {
      warnings.push({
        severity: 'info',
        message: `Disconnected component — not connected to any other service`,
        nodeIds: [node.id],
      });
    }
  }

  return warnings;
}
