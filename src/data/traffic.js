// Traffic simulation: how each category responds to the three slider axes
// Values 0–1 representing sensitivity weight

const CATEGORY_WEIGHTS = {
  networking:  { traffic: 1.0,  throughput: 0.3, users: 0.8 },
  compute:     { traffic: 0.7,  throughput: 0.5, users: 1.0 },
  containers:  { traffic: 0.7,  throughput: 0.5, users: 0.9 },
  serverless:  { traffic: 0.6,  throughput: 0.3, users: 0.5 },
  database:    { traffic: 0.6,  throughput: 0.8, users: 0.7 },
  storage:     { traffic: 0.3,  throughput: 1.0, users: 0.2 },
  analytics:   { traffic: 0.2,  throughput: 1.0, users: 0.1 },
  ai_ml:       { traffic: 0.3,  throughput: 0.8, users: 0.4 },
  messaging:   { traffic: 0.5,  throughput: 0.6, users: 0.3 },
  security:    { traffic: 0.9,  throughput: 0.1, users: 0.7 },
  monitoring:  { traffic: 0.4,  throughput: 0.3, users: 0.2 },
};

// Max RPS per service (simplified — real limits vary by config)
const SERVICE_MAX_RPS = {
  // Networking
  alb: 100000, nlb: 200000, cdn: 250000, dns: 200000,
  api_gateway: 10000, vpc: 500000, transit_gw: 500000,
  // Compute
  ec2: 50000, autoscaling: 50000,
  // Containers
  ecs: 40000, eks: 60000, ecr: 5000,
  // Serverless
  lambda: 10000, step_functions: 3000,
  // Database
  rds: 20000, aurora: 50000, dynamodb: 100000,
  elasticache: 200000, redshift: 5000, neptune: 10000,
  // Storage
  s3: 55000, efs: 10000, ebs: 16000,
  // Analytics
  emr: 5000, kinesis: 50000, athena: 2000, glue: 1000,
  // AI/ML
  sagemaker: 3000, bedrock: 5000, comprehend: 2000,
  // Messaging
  sqs: 70000, sns: 100000, eventbridge: 50000, mq: 10000,
  // Security
  waf: 100000, cognito: 20000, kms: 30000, secrets_mgr: 5000,
  // Monitoring
  cloudwatch: 50000, xray: 20000,
};

/**
 * Compute load (0–1) for a given node based on traffic sliders
 */
export function computeNodeLoad(serviceId, category, sliders) {
  const w = CATEGORY_WEIGHTS[category] || { traffic: 0.5, throughput: 0.5, users: 0.5 };
  const weighted =
    (sliders.traffic / 100) * w.traffic * 0.4 +
    (sliders.throughput / 100) * w.throughput * 0.3 +
    (sliders.users / 100) * w.users * 0.3;
  return Math.min(1, weighted);
}

/**
 * Get max RPS for a service
 */
export function getMaxRps(serviceId) {
  return SERVICE_MAX_RPS[serviceId] || 10000;
}

/**
 * Get the current RPS based on load
 */
export function getCurrentRps(serviceId, category, sliders) {
  const load = computeNodeLoad(serviceId, category, sliders);
  const maxRps = getMaxRps(serviceId);
  return Math.round(maxRps * load);
}

/**
 * Get load color: green -> yellow -> red
 */
export function getLoadColor(loadPct) {
  if (loadPct < 0.01) return 'rgba(255,255,255,0.15)';
  const r = Math.round(loadPct > 0.5 ? 255 : loadPct * 2 * 255);
  const g = Math.round(loadPct < 0.5 ? 255 : (1 - (loadPct - 0.5) * 2) * 255);
  return `rgb(${r},${g},60)`;
}

/**
 * Get status label
 */
export function getStatusLabel(loadPct) {
  if (loadPct > 0.9) return { label: 'CRITICAL', emoji: '🔴' };
  if (loadPct > 0.7) return { label: 'WARNING', emoji: '🟡' };
  if (loadPct > 0.01) return { label: 'HEALTHY', emoji: '🟢' };
  return { label: 'IDLE', emoji: '⚪' };
}
