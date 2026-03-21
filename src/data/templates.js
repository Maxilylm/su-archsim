// Architecture archetype templates
// Each template defines nodes and edges for a common cloud architecture pattern

import { getService } from './catalog';

// Helper: build default config for a service
function defaultConfig(serviceId, overrides = {}) {
  const svc = getService(serviceId);
  if (!svc) return overrides;
  const config = {};
  for (const field of svc.configSchema) {
    config[field.key] = field.default;
  }
  return { ...config, ...overrides };
}

let _idCounter = 100;
function makeId() { return `node_${_idCounter++}`; }

function buildTemplate(def) {
  _idCounter = 100;
  const nodes = def.nodes.map(n => {
    const id = makeId();
    n._id = id;
    return {
      id,
      serviceId: n.serviceId,
      category: getService(n.serviceId)?.category || 'compute',
      x: n.x,
      y: n.y,
      config: defaultConfig(n.serviceId, n.config || {}),
    };
  });

  const edges = def.edges.map(([srcIdx, tgtIdx]) => ({
    id: `edge_${nodes[srcIdx].id}_${nodes[tgtIdx].id}`,
    source: nodes[srcIdx].id,
    target: nodes[tgtIdx].id,
  }));

  return { nodes, edges };
}

export const TEMPLATES = [
  {
    id: 'simple_web_app',
    name: 'Simple Web App',
    desc: 'DNS, CDN, load balancer, compute, and database - the classic hosted application',
    icon: '🌐',
    isDefault: true,
    build: () => buildTemplate({
      nodes: [
        { serviceId: 'dns',   x: 400, y: 300 },
        { serviceId: 'cdn',   x: 700, y: 300 },
        { serviceId: 'alb',   x: 1000, y: 300 },
        { serviceId: 'ec2',   x: 1300, y: 200, config: { count: 2, autoScaling: true } },
        { serviceId: 'rds',   x: 1600, y: 200, config: { multiAz: true } },
        { serviceId: 's3',    x: 1300, y: 420 },
      ],
      edges: [
        [0, 1], // dns -> cdn
        [1, 2], // cdn -> alb
        [2, 3], // alb -> ec2
        [3, 4], // ec2 -> rds
        [3, 5], // ec2 -> s3
      ],
    }),
  },
  {
    id: 'three_tier',
    name: 'Three-Tier Architecture',
    desc: 'Presentation, application, and data tiers with caching and object storage',
    icon: '🏗️',
    build: () => buildTemplate({
      nodes: [
        { serviceId: 'dns',         x: 300, y: 350 },
        { serviceId: 'cdn',         x: 550, y: 350 },
        { serviceId: 'waf',         x: 800, y: 200 },
        { serviceId: 'alb',         x: 800, y: 450 },
        { serviceId: 'autoscaling', x: 1100, y: 350, config: { minSize: 2, maxSize: 20 } },
        { serviceId: 'ec2',         x: 1100, y: 550, config: { count: 4 } },
        { serviceId: 'elasticache', x: 1400, y: 250 },
        { serviceId: 'rds',         x: 1400, y: 450, config: { multiAz: true, readReplicas: 2 } },
        { serviceId: 's3',          x: 1400, y: 650 },
        { serviceId: 'cloudwatch',  x: 1700, y: 350 },
      ],
      edges: [
        [0, 1], // dns -> cdn
        [1, 3], // cdn -> alb
        [2, 3], // waf -> alb
        [3, 4], // alb -> autoscaling
        [3, 5], // alb -> ec2
        [5, 6], // ec2 -> elasticache
        [5, 7], // ec2 -> rds
        [5, 8], // ec2 -> s3
        [7, 9], // rds -> cloudwatch
      ],
    }),
  },
  {
    id: 'serverless_api',
    name: 'Serverless API',
    desc: 'API Gateway with Lambda functions, DynamoDB, and event-driven processing',
    icon: '⚡',
    build: () => buildTemplate({
      nodes: [
        { serviceId: 'dns',          x: 300, y: 350 },
        { serviceId: 'api_gateway',  x: 600, y: 350, config: { auth: 'JWT/OAuth2' } },
        { serviceId: 'cognito',      x: 600, y: 150 },
        { serviceId: 'lambda',       x: 950, y: 250, config: { memory: '512', runtime: 'Node.js 22' } },
        { serviceId: 'lambda',       x: 950, y: 450, config: { memory: '1024', runtime: 'Python 3.13' } },
        { serviceId: 'dynamodb',     x: 1300, y: 250, config: { capacityMode: 'On-Demand' } },
        { serviceId: 's3',           x: 1300, y: 450 },
        { serviceId: 'sqs',          x: 1300, y: 650 },
        { serviceId: 'cloudwatch',   x: 1600, y: 350 },
      ],
      edges: [
        [0, 1], // dns -> api_gw
        [2, 1], // cognito -> api_gw
        [1, 3], // api_gw -> lambda 1
        [1, 4], // api_gw -> lambda 2
        [3, 5], // lambda 1 -> dynamodb
        [4, 6], // lambda 2 -> s3
        [4, 7], // lambda 2 -> sqs
      ],
    }),
  },
  {
    id: 'microservices',
    name: 'Microservices',
    desc: 'Container-based microservices with service mesh, message queues, and shared data stores',
    icon: '📦',
    build: () => buildTemplate({
      nodes: [
        { serviceId: 'dns',         x: 250, y: 400 },
        { serviceId: 'cdn',         x: 500, y: 400 },
        { serviceId: 'alb',         x: 750, y: 400 },
        { serviceId: 'eks',         x: 1050, y: 250, config: { nodeCount: 6 } },
        { serviceId: 'ecs',         x: 1050, y: 550, config: { desiredCount: 4 } },
        { serviceId: 'ecr',         x: 750, y: 150 },
        { serviceId: 'rds',         x: 1400, y: 200 },
        { serviceId: 'elasticache', x: 1400, y: 400 },
        { serviceId: 'sqs',         x: 1400, y: 600 },
        { serviceId: 'sns',         x: 1700, y: 400 },
        { serviceId: 'cloudwatch',  x: 1700, y: 200 },
        { serviceId: 'xray',        x: 1700, y: 600 },
      ],
      edges: [
        [0, 1], // dns -> cdn
        [1, 2], // cdn -> alb
        [2, 3], // alb -> eks
        [2, 4], // alb -> ecs
        [3, 6], // eks -> rds
        [3, 7], // eks -> elasticache
        [4, 8], // ecs -> sqs
        [8, 9], // sqs -> sns
        [3, 10], // eks -> cloudwatch
        [4, 11], // ecs -> xray
      ],
    }),
  },
  {
    id: 'data_pipeline',
    name: 'Data Pipeline',
    desc: 'Real-time ingestion, ETL processing, data warehouse, and analytics',
    icon: '📊',
    build: () => buildTemplate({
      nodes: [
        { serviceId: 'kinesis',    x: 350, y: 300 },
        { serviceId: 'lambda',     x: 650, y: 200, config: { memory: '2048', timeout: 300 } },
        { serviceId: 's3',         x: 650, y: 450 },
        { serviceId: 'glue',       x: 1000, y: 300 },
        { serviceId: 'redshift',   x: 1350, y: 200, config: { mode: 'Serverless' } },
        { serviceId: 'athena',     x: 1350, y: 450 },
        { serviceId: 'emr',        x: 1000, y: 550, config: { framework: 'Spark 3.5' } },
        { serviceId: 'cloudwatch', x: 1650, y: 300 },
      ],
      edges: [
        [0, 1], // kinesis -> lambda
        [0, 2], // kinesis -> s3 (raw)
        [2, 3], // s3 -> glue
        [3, 4], // glue -> redshift
        [2, 5], // s3 -> athena
        [2, 6], // s3 -> emr
        [6, 2], // emr -> s3 (processed)
      ],
    }),
  },
  {
    id: 'ml_platform',
    name: 'ML Platform',
    desc: 'End-to-end machine learning with training, serving, and foundation models',
    icon: '🧠',
    build: () => buildTemplate({
      nodes: [
        { serviceId: 's3',          x: 350, y: 350, config: { versioning: true } },
        { serviceId: 'sagemaker',   x: 700, y: 250 },
        { serviceId: 'bedrock',     x: 700, y: 500 },
        { serviceId: 'api_gateway', x: 1050, y: 350 },
        { serviceId: 'lambda',      x: 1350, y: 250, config: { memory: '2048' } },
        { serviceId: 'dynamodb',    x: 1350, y: 500, config: { capacityMode: 'On-Demand' } },
        { serviceId: 'cloudwatch',  x: 1050, y: 150 },
      ],
      edges: [
        [0, 1], // s3 -> sagemaker
        [0, 2], // s3 -> bedrock
        [1, 3], // sagemaker -> api_gw (inference endpoint)
        [2, 3], // bedrock -> api_gw
        [3, 4], // api_gw -> lambda
        [4, 5], // lambda -> dynamodb
      ],
    }),
  },
  {
    id: 'event_driven',
    name: 'Event-Driven Architecture',
    desc: 'Event bus with fan-out to multiple consumers via queues and functions',
    icon: '📨',
    build: () => buildTemplate({
      nodes: [
        { serviceId: 'api_gateway',  x: 350, y: 350 },
        { serviceId: 'eventbridge',  x: 700, y: 350 },
        { serviceId: 'sqs',          x: 1050, y: 200 },
        { serviceId: 'sqs',          x: 1050, y: 500 },
        { serviceId: 'lambda',       x: 1350, y: 200 },
        { serviceId: 'lambda',       x: 1350, y: 500 },
        { serviceId: 'dynamodb',     x: 1650, y: 200 },
        { serviceId: 'sns',          x: 1650, y: 500 },
        { serviceId: 'step_functions', x: 700, y: 550 },
      ],
      edges: [
        [0, 1], // api_gw -> eventbridge
        [1, 2], // eventbridge -> sqs 1
        [1, 3], // eventbridge -> sqs 2
        [2, 4], // sqs 1 -> lambda 1
        [3, 5], // sqs 2 -> lambda 2
        [4, 6], // lambda 1 -> dynamodb
        [5, 7], // lambda 2 -> sns
        [0, 8], // api_gw -> step_functions
      ],
    }),
  },
  {
    id: 'static_site',
    name: 'Static Website + API',
    desc: 'CDN-hosted static site with serverless API backend',
    icon: '🖥️',
    build: () => buildTemplate({
      nodes: [
        { serviceId: 'dns',         x: 300, y: 300 },
        { serviceId: 'cdn',         x: 600, y: 200 },
        { serviceId: 's3',          x: 900, y: 200, config: { storageClass: 'Standard' } },
        { serviceId: 'api_gateway', x: 600, y: 450 },
        { serviceId: 'lambda',      x: 950, y: 450, config: { memory: '512' } },
        { serviceId: 'dynamodb',    x: 1300, y: 350 },
        { serviceId: 'cognito',     x: 950, y: 600 },
      ],
      edges: [
        [0, 1], // dns -> cdn
        [1, 2], // cdn -> s3
        [0, 3], // dns -> api_gw
        [3, 4], // api_gw -> lambda
        [4, 5], // lambda -> dynamodb
        [6, 3], // cognito -> api_gw
      ],
    }),
  },
];

export function getDefaultTemplate() {
  return TEMPLATES.find(t => t.isDefault) || TEMPLATES[0];
}

export function getTemplate(id) {
  return TEMPLATES.find(t => t.id === id);
}
