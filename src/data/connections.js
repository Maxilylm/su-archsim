// Connection validation rules
// Defines which category pairs can connect and specific service-level overrides

// Category-level rules: { from_category: [allowed_to_categories] }
const CATEGORY_RULES = {
  networking: ['networking', 'compute', 'containers', 'serverless', 'storage', 'security', 'monitoring'],
  compute:    ['database', 'storage', 'messaging', 'analytics', 'ai_ml', 'networking', 'containers', 'serverless', 'monitoring', 'security', 'compute'],
  containers: ['database', 'storage', 'messaging', 'analytics', 'ai_ml', 'networking', 'monitoring', 'security', 'containers'],
  serverless: ['database', 'storage', 'messaging', 'analytics', 'ai_ml', 'networking', 'monitoring', 'security', 'serverless'],
  database:   ['database', 'storage', 'messaging', 'analytics', 'monitoring'],
  storage:    ['analytics', 'ai_ml', 'serverless', 'monitoring'],
  analytics:  ['storage', 'database', 'messaging', 'ai_ml', 'monitoring', 'analytics'],
  ai_ml:      ['storage', 'database', 'messaging', 'monitoring', 'compute', 'serverless'],
  messaging:  ['compute', 'containers', 'serverless', 'analytics', 'monitoring', 'messaging'],
  security:   ['networking', 'compute', 'containers', 'serverless', 'monitoring'],
  monitoring: [], // Monitoring receives connections, rarely initiates
};

// Specific service-level rules (overrides) - format: { serviceId: { allow: [...], deny: [...], denyReason: string } }
const SERVICE_OVERRIDES = {
  cdn: {
    allow: ['alb', 'nlb', 's3', 'api_gateway', 'ec2', 'ecs', 'lambda', 'waf'],
    denyMessage: 'CDN can only front load balancers, API gateways, compute, storage, or WAF',
  },
  dns: {
    allow: ['cdn', 'alb', 'nlb', 'api_gateway', 'ec2', 'ecs', 'eks', 's3'],
    denyMessage: 'DNS resolves to load balancers, CDN, API gateways, compute, or storage endpoints',
  },
  alb: {
    allow: ['ec2', 'ecs', 'eks', 'lambda', 'autoscaling', 'waf'],
    denyMessage: 'ALB routes to compute targets (EC2, ECS, EKS, Lambda, Auto Scaling) or WAF',
  },
  nlb: {
    allow: ['ec2', 'ecs', 'eks', 'autoscaling', 'alb'],
    denyMessage: 'NLB routes to compute targets (EC2, ECS, EKS, ASG) or ALB (for static IP + L7)',
  },
  waf: {
    allow: ['alb', 'cdn', 'api_gateway'],
    denyMessage: 'WAF attaches to ALB, CloudFront/CDN, or API Gateway only',
  },
  api_gateway: {
    allow: ['lambda', 'ec2', 'ecs', 'eks', 'nlb', 'alb', 'step_functions', 'sqs', 'kinesis', 'eventbridge', 'cognito'],
    denyMessage: 'API Gateway routes to compute, queues, event buses, or auth services',
  },
  vpc: {
    allow: ['ec2', 'ecs', 'eks', 'rds', 'aurora', 'elasticache', 'redshift', 'neptune', 'emr', 'sagemaker', 'lambda', 'transit_gw'],
    denyMessage: 'VPC contains compute, database, analytics, and ML resources',
  },
  transit_gw: {
    allow: ['vpc'],
    denyMessage: 'Transit Gateway connects VPCs together',
  },
  cognito: {
    allow: ['api_gateway', 'alb', 'lambda'],
    denyMessage: 'Cognito provides auth to API Gateway, ALB, or Lambda',
  },
  ebs: {
    allow: ['ec2'],
    denyMessage: 'EBS volumes attach to EC2 instances only',
  },
};

// Deny self-connections for specific services
const DENY_SELF = new Set(['ebs', 'efs', 'kms', 'secrets_mgr', 'waf', 'cognito', 'vpc', 'transit_gw']);

/**
 * Validate whether a connection from sourceId to targetId is allowed
 * @param {string} sourceServiceId - The service type id of the source node
 * @param {string} targetServiceId - The service type id of the target node
 * @param {string} sourceCategory - Category of source
 * @param {string} targetCategory - Category of target
 * @returns {{ allowed: boolean, reason: string }}
 */
export function validateConnection(sourceServiceId, targetServiceId, sourceCategory, targetCategory) {
  // No self-connections (same node instance handled by caller, this checks same service type)
  if (sourceServiceId === targetServiceId && DENY_SELF.has(sourceServiceId)) {
    return { allowed: false, reason: `${sourceServiceId} cannot connect to another ${sourceServiceId}` };
  }

  // Check service-level overrides first (source)
  const srcOverride = SERVICE_OVERRIDES[sourceServiceId];
  if (srcOverride) {
    if (srcOverride.allow && !srcOverride.allow.includes(targetServiceId)) {
      return { allowed: false, reason: srcOverride.denyMessage };
    }
    return { allowed: true, reason: 'Allowed by service rule' };
  }

  // Check service-level overrides (target receiving)
  // Some services have strict rules about what can connect TO them
  const tgtOverride = SERVICE_OVERRIDES[targetServiceId];
  if (tgtOverride && tgtOverride.receiveFrom) {
    if (!tgtOverride.receiveFrom.includes(sourceServiceId)) {
      return { allowed: false, reason: `${targetServiceId} cannot receive connections from ${sourceServiceId}` };
    }
  }

  // Fall back to category-level rules
  const allowedCategories = CATEGORY_RULES[sourceCategory];
  if (!allowedCategories) {
    return { allowed: false, reason: `${sourceCategory} components cannot initiate connections` };
  }

  if (!allowedCategories.includes(targetCategory)) {
    return {
      allowed: false,
      reason: `${sourceCategory} components cannot connect to ${targetCategory} components`,
    };
  }

  return { allowed: true, reason: 'Allowed by category rule' };
}

/**
 * Get a human-readable description of a connection
 */
export function getConnectionLabel(sourceId, targetId) {
  const labels = {
    'dns->cdn': 'DNS Resolution',
    'dns->alb': 'DNS Resolution',
    'dns->nlb': 'DNS Resolution',
    'cdn->alb': 'Origin Fetch',
    'cdn->s3': 'Static Assets',
    'alb->ec2': 'HTTP Routing',
    'alb->ecs': 'HTTP Routing',
    'alb->eks': 'HTTP Routing',
    'alb->lambda': 'HTTP Routing',
    'nlb->ec2': 'TCP/UDP Routing',
    'api_gateway->lambda': 'API Invocation',
    'ec2->rds': 'SQL Query',
    'ec2->aurora': 'SQL Query',
    'ec2->dynamodb': 'NoSQL Query',
    'ec2->elasticache': 'Cache Read/Write',
    'ec2->s3': 'Object Read/Write',
    'ec2->sqs': 'Enqueue/Dequeue',
    'ec2->sns': 'Publish',
    'lambda->rds': 'SQL Query',
    'lambda->dynamodb': 'NoSQL Query',
    'lambda->s3': 'Object Read/Write',
    'lambda->sqs': 'Enqueue/Dequeue',
    'sqs->lambda': 'Event Trigger',
    'sns->sqs': 'Fan-out',
    'sns->lambda': 'Push Notification',
    'eventbridge->lambda': 'Event Trigger',
    'kinesis->lambda': 'Stream Processing',
    'emr->s3': 'Data Lake I/O',
    'sagemaker->s3': 'Training Data',
    'bedrock->s3': 'Knowledge Base',
    'waf->alb': 'Traffic Filtering',
    'waf->cdn': 'Edge Protection',
    'cognito->api_gateway': 'Authorization',
  };

  return labels[`${sourceId}->${targetId}`] || 'Connection';
}
