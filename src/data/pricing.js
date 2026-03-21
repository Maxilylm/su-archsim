// Simplified monthly cost estimates per service (USD)
// Costs are rough approximations based on default configs

const BASE_COSTS = {
  // Networking
  alb: 22, nlb: 22, cdn: 50, dns: 0.5, api_gateway: 3.5, vpc: 0, transit_gw: 36,
  // Compute
  ec2: 62, autoscaling: 0,
  // Containers
  ecs: 36, eks: 73, ecr: 5,
  // Serverless
  lambda: 0, step_functions: 0,
  // Database
  rds: 100, aurora: 145, dynamodb: 25, elasticache: 47, redshift: 180, neptune: 115,
  // Storage
  s3: 2.3, efs: 30, ebs: 8,
  // Analytics
  emr: 115, kinesis: 36, athena: 5, glue: 44,
  // AI/ML
  sagemaker: 160, bedrock: 0, comprehend: 0,
  // Messaging
  sqs: 0, sns: 0, eventbridge: 0, mq: 28,
  // Security
  waf: 6, cognito: 0, kms: 1, secrets_mgr: 0.4,
  // Monitoring
  cloudwatch: 0, xray: 0,
};

// Multipliers based on config fields
const CONFIG_MULTIPLIERS = {
  ec2: (config) => {
    const count = config.count || 1;
    const typeMultiplier = {
      't3.micro': 0.15, 't3.small': 0.3, 't3.medium': 0.6,
      'm7g.large': 1.0, 'm7g.xlarge': 2.0, 'm7g.2xlarge': 4.0,
      'c7g.large': 1.1, 'c7g.xlarge': 2.2, 'c7g.2xlarge': 4.4,
      'r7g.large': 1.3, 'r7g.xlarge': 2.6, 'r7g.2xlarge': 5.2,
    };
    return count * (typeMultiplier[config.instanceType] || 1);
  },
  rds: (config) => {
    let mult = 1;
    if (config.multiAz) mult *= 2;
    mult += (config.readReplicas || 0) * 0.8;
    return mult;
  },
  aurora: (config) => {
    let mult = 1;
    if (config.multiAz) mult *= 1.5;
    mult += (config.readReplicas || 0) * 0.7;
    return mult;
  },
  elasticache: (config) => (config.replicas || 0) + 1,
  eks: (config) => (config.nodeCount || 3) / 3,
  ecs: (config) => (config.desiredCount || 2) / 2,
  lambda: (config) => {
    const mem = parseInt(config.memory) || 128;
    return mem / 128 * 0.5; // rough per-invocation scaling
  },
  s3: (config) => {
    const classMultiplier = { 'Standard': 1, 'Intelligent-Tiering': 0.9, 'Standard-IA': 0.5, 'Glacier Instant': 0.3, 'Glacier Deep': 0.05 };
    return classMultiplier[config.storageClass] || 1;
  },
  redshift: (config) => config.mode === 'Serverless' ? 0.7 : 1,
};

// Cloud provider cost multipliers (rough relative pricing)
const CLOUD_MULTIPLIERS = {
  aws: 1.0,
  gcp: 0.92,
  azure: 0.97,
};

/**
 * Estimate monthly cost for a single node
 */
export function estimateNodeCost(serviceId, config, cloud = 'aws') {
  const baseCost = BASE_COSTS[serviceId] || 0;
  const configMult = CONFIG_MULTIPLIERS[serviceId] ? CONFIG_MULTIPLIERS[serviceId](config) : 1;
  const cloudMult = CLOUD_MULTIPLIERS[cloud] || 1;
  return Math.round(baseCost * configMult * cloudMult * 100) / 100;
}

/**
 * Format cost for display
 */
export function formatCost(cost) {
  if (cost >= 1000) return `$${(cost / 1000).toFixed(1)}k`;
  if (cost === 0) return 'Free tier';
  if (cost < 1) return `$${cost.toFixed(2)}`;
  return `$${Math.round(cost)}`;
}
