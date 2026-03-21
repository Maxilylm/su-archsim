// Comprehensive cloud service catalog with real configurations
// Categories: compute, networking, database, storage, analytics, ai_ml, messaging, security, serverless, containers, monitoring

export const CATEGORIES = {
  networking: { label: 'Networking', icon: '🌐', color: '#3b82f6' },
  compute:    { label: 'Compute',    icon: '🖥️', color: '#f97316' },
  containers: { label: 'Containers', icon: '📦', color: '#8b5cf6' },
  serverless: { label: 'Serverless', icon: '⚡', color: '#eab308' },
  database:   { label: 'Database',   icon: '🗄️', color: '#06b6d4' },
  storage:    { label: 'Storage',    icon: '💾', color: '#10b981' },
  analytics:  { label: 'Analytics',  icon: '📊', color: '#ec4899' },
  ai_ml:      { label: 'AI / ML',    icon: '🧠', color: '#a855f7' },
  messaging:  { label: 'Messaging',  icon: '📨', color: '#f43f5e' },
  security:   { label: 'Security',   icon: '🔒', color: '#64748b' },
  monitoring: { label: 'Monitoring', icon: '📡', color: '#14b8a6' },
};

// Config field types: select, number, boolean, text
// Each service has: id, category, clouds (aws/gcp/azure label+desc), configSchema

const SERVICES = [
  // ═══════════════════════ NETWORKING ═══════════════════════
  {
    id: 'alb',
    category: 'networking',
    clouds: {
      aws:   { label: 'Application Load Balancer', desc: 'Layer 7 HTTP/HTTPS load balancing with content-based routing' },
      gcp:   { label: 'External HTTP(S) LB',       desc: 'Global Layer 7 load balancer with URL map routing' },
      azure: { label: 'Application Gateway',       desc: 'Layer 7 load balancer with WAF and SSL termination' },
    },
    configSchema: [
      { key: 'scheme', label: 'Scheme', type: 'select', options: ['internet-facing', 'internal'], default: 'internet-facing' },
      { key: 'listeners', label: 'Listeners', type: 'number', min: 1, max: 50, default: 2 },
      { key: 'ssl', label: 'SSL Termination', type: 'boolean', default: true },
      { key: 'waf', label: 'WAF Enabled', type: 'boolean', default: false },
      { key: 'crossZone', label: 'Cross-Zone LB', type: 'boolean', default: true },
    ],
  },
  {
    id: 'nlb',
    category: 'networking',
    clouds: {
      aws:   { label: 'Network Load Balancer',   desc: 'Layer 4 TCP/UDP ultra-low latency load balancing' },
      gcp:   { label: 'External TCP/UDP LB',     desc: 'Regional Layer 4 load balancer with TCP/UDP/SSL' },
      azure: { label: 'Azure Load Balancer',      desc: 'Layer 4 load balancer with zone-redundant frontend' },
    },
    configSchema: [
      { key: 'scheme', label: 'Scheme', type: 'select', options: ['internet-facing', 'internal'], default: 'internet-facing' },
      { key: 'protocol', label: 'Protocol', type: 'select', options: ['TCP', 'UDP', 'TLS', 'TCP_UDP'], default: 'TCP' },
      { key: 'crossZone', label: 'Cross-Zone', type: 'boolean', default: true },
      { key: 'staticIp', label: 'Static IP', type: 'boolean', default: false },
    ],
  },
  {
    id: 'cdn',
    category: 'networking',
    clouds: {
      aws:   { label: 'CloudFront',    desc: '450+ edge locations, Lambda@Edge, Origin Shield' },
      gcp:   { label: 'Cloud CDN',     desc: 'Content delivery with Google edge, Cache-Control based' },
      azure: { label: 'Azure CDN',     desc: 'Global CDN with Verizon/Akamai/Microsoft POP networks' },
    },
    configSchema: [
      { key: 'priceClass', label: 'Price Class', type: 'select', options: ['All Edges', 'NA + EU', 'NA + EU + Asia'], default: 'All Edges' },
      { key: 'http2', label: 'HTTP/2', type: 'boolean', default: true },
      { key: 'http3', label: 'HTTP/3 (QUIC)', type: 'boolean', default: false },
      { key: 'compression', label: 'Compression', type: 'boolean', default: true },
      { key: 'cacheTtl', label: 'Default TTL (sec)', type: 'number', min: 0, max: 31536000, default: 86400 },
    ],
  },
  {
    id: 'dns',
    category: 'networking',
    clouds: {
      aws:   { label: 'Route 53',     desc: 'Scalable DNS, health checks, traffic routing policies' },
      gcp:   { label: 'Cloud DNS',    desc: '100% SLA DNS, DNSSEC, private zones' },
      azure: { label: 'Azure DNS',    desc: 'DNS hosting on Azure infra, alias records, Private DNS' },
    },
    configSchema: [
      { key: 'routingPolicy', label: 'Routing Policy', type: 'select', options: ['Simple', 'Weighted', 'Latency', 'Failover', 'Geolocation', 'Multivalue'], default: 'Simple' },
      { key: 'dnssec', label: 'DNSSEC', type: 'boolean', default: false },
      { key: 'healthChecks', label: 'Health Checks', type: 'boolean', default: true },
    ],
  },
  {
    id: 'api_gateway',
    category: 'networking',
    clouds: {
      aws:   { label: 'API Gateway',      desc: 'REST, HTTP, WebSocket APIs with throttling and auth' },
      gcp:   { label: 'Apigee',           desc: 'Full API lifecycle management, analytics, developer portal' },
      azure: { label: 'API Management',   desc: 'Hybrid API gateway with developer portal and analytics' },
    },
    configSchema: [
      { key: 'apiType', label: 'API Type', type: 'select', options: ['REST', 'HTTP', 'WebSocket', 'GraphQL'], default: 'REST' },
      { key: 'throttle', label: 'Rate Limit (rps)', type: 'number', min: 100, max: 100000, default: 10000 },
      { key: 'auth', label: 'Authorization', type: 'select', options: ['None', 'API Key', 'IAM', 'JWT/OAuth2', 'Cognito/Identity'], default: 'JWT/OAuth2' },
      { key: 'cors', label: 'CORS Enabled', type: 'boolean', default: true },
      { key: 'caching', label: 'Response Caching', type: 'boolean', default: false },
    ],
  },
  {
    id: 'vpc',
    category: 'networking',
    clouds: {
      aws:   { label: 'VPC',              desc: 'Virtual Private Cloud with subnets, NACLs, flow logs' },
      gcp:   { label: 'VPC Network',      desc: 'Global VPC with subnets, firewall rules, shared VPC' },
      azure: { label: 'Virtual Network',  desc: 'VNet with subnets, NSGs, service endpoints, peering' },
    },
    configSchema: [
      { key: 'cidr', label: 'CIDR Block', type: 'text', default: '10.0.0.0/16' },
      { key: 'subnets', label: 'Subnets', type: 'number', min: 1, max: 200, default: 4 },
      { key: 'natGateway', label: 'NAT Gateway', type: 'boolean', default: true },
      { key: 'flowLogs', label: 'Flow Logs', type: 'boolean', default: false },
      { key: 'dnsResolution', label: 'DNS Resolution', type: 'boolean', default: true },
    ],
  },
  {
    id: 'transit_gw',
    category: 'networking',
    clouds: {
      aws:   { label: 'Transit Gateway',          desc: 'Hub-and-spoke VPC/VPN connectivity at scale' },
      gcp:   { label: 'Network Connectivity Ctr',  desc: 'Hub-and-spoke topology with HA VPN and interconnect' },
      azure: { label: 'Virtual WAN',              desc: 'Branch-to-branch, branch-to-Azure transit networking' },
    },
    configSchema: [
      { key: 'attachments', label: 'VPC Attachments', type: 'number', min: 1, max: 5000, default: 4 },
      { key: 'vpn', label: 'VPN Enabled', type: 'boolean', default: false },
      { key: 'multicast', label: 'Multicast', type: 'boolean', default: false },
    ],
  },

  // ═══════════════════════ COMPUTE ═══════════════════════
  {
    id: 'ec2',
    category: 'compute',
    clouds: {
      aws:   { label: 'EC2',              desc: 'Virtual servers with 750+ instance types' },
      gcp:   { label: 'Compute Engine',   desc: 'VMs with custom machine types, live migration' },
      azure: { label: 'Virtual Machines', desc: 'VMs with 700+ sizes, Spot VMs, Dedicated Hosts' },
    },
    configSchema: [
      { key: 'instanceType', label: 'Instance Type', type: 'select', options: [
        't3.micro', 't3.small', 't3.medium', 't3.large',
        'm7g.large', 'm7g.xlarge', 'm7g.2xlarge', 'm7g.4xlarge',
        'c7g.large', 'c7g.xlarge', 'c7g.2xlarge',
        'r7g.large', 'r7g.xlarge', 'r7g.2xlarge',
        'p4d.24xlarge', 'g5.xlarge', 'g5.2xlarge',
      ], default: 'm7g.xlarge' },
      { key: 'count', label: 'Instance Count', type: 'number', min: 1, max: 100, default: 2 },
      { key: 'os', label: 'OS', type: 'select', options: ['Amazon Linux 2023', 'Ubuntu 24.04', 'Windows Server 2022', 'RHEL 9', 'Debian 12'], default: 'Amazon Linux 2023' },
      { key: 'storageGb', label: 'EBS Storage (GB)', type: 'number', min: 8, max: 16384, default: 100 },
      { key: 'storageType', label: 'Storage Type', type: 'select', options: ['gp3', 'gp2', 'io2', 'st1', 'sc1'], default: 'gp3' },
      { key: 'spot', label: 'Spot Instance', type: 'boolean', default: false },
      { key: 'autoScaling', label: 'Auto Scaling', type: 'boolean', default: true },
      { key: 'minInstances', label: 'Min Instances', type: 'number', min: 1, max: 50, default: 2 },
      { key: 'maxInstances', label: 'Max Instances', type: 'number', min: 1, max: 100, default: 10 },
    ],
  },
  {
    id: 'autoscaling',
    category: 'compute',
    clouds: {
      aws:   { label: 'Auto Scaling Group', desc: 'Automatic scaling based on demand, scheduled, or predictive' },
      gcp:   { label: 'Instance Group',     desc: 'Managed instance group with autoscaler and autohealing' },
      azure: { label: 'VM Scale Set',       desc: 'Auto-scaling VM fleet with rolling upgrades' },
    },
    configSchema: [
      { key: 'minSize', label: 'Min Size', type: 'number', min: 0, max: 100, default: 2 },
      { key: 'maxSize', label: 'Max Size', type: 'number', min: 1, max: 1000, default: 10 },
      { key: 'desiredCapacity', label: 'Desired', type: 'number', min: 1, max: 100, default: 2 },
      { key: 'scalingPolicy', label: 'Scaling Policy', type: 'select', options: ['Target Tracking', 'Step Scaling', 'Simple', 'Predictive'], default: 'Target Tracking' },
      { key: 'targetCpu', label: 'Target CPU %', type: 'number', min: 10, max: 90, default: 60 },
      { key: 'healthCheck', label: 'Health Check', type: 'select', options: ['EC2', 'ELB', 'Custom'], default: 'ELB' },
    ],
  },

  // ═══════════════════════ CONTAINERS ═══════════════════════
  {
    id: 'ecs',
    category: 'containers',
    clouds: {
      aws:   { label: 'ECS',                     desc: 'Container orchestration with Fargate or EC2 launch type' },
      gcp:   { label: 'Cloud Run',                desc: 'Fully managed container platform, scale to zero' },
      azure: { label: 'Container Apps',           desc: 'Serverless containers with Dapr, KEDA, Envoy' },
    },
    configSchema: [
      { key: 'launchType', label: 'Launch Type', type: 'select', options: ['Fargate', 'EC2', 'External'], default: 'Fargate' },
      { key: 'cpu', label: 'vCPU', type: 'select', options: ['0.25', '0.5', '1', '2', '4', '8', '16'], default: '1' },
      { key: 'memory', label: 'Memory (GB)', type: 'select', options: ['0.5', '1', '2', '4', '8', '16', '30', '60', '120'], default: '2' },
      { key: 'desiredCount', label: 'Desired Tasks', type: 'number', min: 1, max: 100, default: 2 },
      { key: 'autoScaling', label: 'Auto Scaling', type: 'boolean', default: true },
      { key: 'serviceConnect', label: 'Service Connect', type: 'boolean', default: false },
    ],
  },
  {
    id: 'eks',
    category: 'containers',
    clouds: {
      aws:   { label: 'EKS',                 desc: 'Managed Kubernetes with Fargate or EC2 node groups' },
      gcp:   { label: 'GKE',                 desc: 'Managed Kubernetes with Autopilot and GKE Enterprise' },
      azure: { label: 'AKS',                 desc: 'Managed Kubernetes with virtual nodes and GitOps' },
    },
    configSchema: [
      { key: 'version', label: 'K8s Version', type: 'select', options: ['1.31', '1.30', '1.29', '1.28'], default: '1.31' },
      { key: 'nodeType', label: 'Node Type', type: 'select', options: ['Managed', 'Fargate', 'Self-managed'], default: 'Managed' },
      { key: 'nodeCount', label: 'Node Count', type: 'number', min: 1, max: 100, default: 3 },
      { key: 'instanceType', label: 'Node Instance', type: 'select', options: ['t3.medium', 'm7g.large', 'm7g.xlarge', 'c7g.xlarge', 'r7g.large'], default: 'm7g.large' },
      { key: 'clusterAutoscaler', label: 'Cluster Autoscaler', type: 'boolean', default: true },
      { key: 'logging', label: 'Control Plane Logging', type: 'boolean', default: true },
    ],
  },
  {
    id: 'ecr',
    category: 'containers',
    clouds: {
      aws:   { label: 'ECR',                    desc: 'Docker container registry with image scanning' },
      gcp:   { label: 'Artifact Registry',       desc: 'Container and package registry with vulnerability scanning' },
      azure: { label: 'Container Registry',      desc: 'Docker registry with geo-replication and tasks' },
    },
    configSchema: [
      { key: 'scanOnPush', label: 'Scan on Push', type: 'boolean', default: true },
      { key: 'encryption', label: 'Encryption', type: 'select', options: ['AES-256', 'KMS'], default: 'AES-256' },
      { key: 'immutableTags', label: 'Immutable Tags', type: 'boolean', default: false },
      { key: 'lifecyclePolicy', label: 'Lifecycle Policy', type: 'boolean', default: true },
    ],
  },

  // ═══════════════════════ SERVERLESS ═══════════════════════
  {
    id: 'lambda',
    category: 'serverless',
    clouds: {
      aws:   { label: 'Lambda',           desc: 'Serverless functions, 15min timeout, 10GB memory' },
      gcp:   { label: 'Cloud Functions',   desc: 'Event-driven serverless, 2nd gen with Cloud Run backend' },
      azure: { label: 'Azure Functions',   desc: 'Serverless compute with durable functions and bindings' },
    },
    configSchema: [
      { key: 'runtime', label: 'Runtime', type: 'select', options: ['Node.js 22', 'Python 3.13', 'Java 21', 'Go 1.22', '.NET 8', 'Ruby 3.3', 'Rust (custom)'], default: 'Node.js 22' },
      { key: 'memory', label: 'Memory (MB)', type: 'select', options: ['128', '256', '512', '1024', '2048', '4096', '8192', '10240'], default: '512' },
      { key: 'timeout', label: 'Timeout (sec)', type: 'number', min: 1, max: 900, default: 30 },
      { key: 'concurrency', label: 'Reserved Concurrency', type: 'number', min: 0, max: 3000, default: 100 },
      { key: 'snapStart', label: 'SnapStart (Java)', type: 'boolean', default: false },
      { key: 'provisionedConcurrency', label: 'Provisioned Concurrency', type: 'number', min: 0, max: 500, default: 0 },
      { key: 'ephemeralStorage', label: 'Ephemeral Storage (MB)', type: 'number', min: 512, max: 10240, default: 512 },
    ],
  },
  {
    id: 'step_functions',
    category: 'serverless',
    clouds: {
      aws:   { label: 'Step Functions',    desc: 'Visual workflow orchestration with Standard and Express' },
      gcp:   { label: 'Workflows',         desc: 'Serverless workflow orchestration with YAML/JSON' },
      azure: { label: 'Logic Apps',        desc: 'Visual workflow designer with 400+ connectors' },
    },
    configSchema: [
      { key: 'type', label: 'Workflow Type', type: 'select', options: ['Standard', 'Express'], default: 'Standard' },
      { key: 'logging', label: 'Execution Logging', type: 'select', options: ['OFF', 'ALL', 'ERROR', 'FATAL'], default: 'ERROR' },
      { key: 'xray', label: 'X-Ray Tracing', type: 'boolean', default: false },
    ],
  },

  // ═══════════════════════ DATABASE ═══════════════════════
  {
    id: 'rds',
    category: 'database',
    clouds: {
      aws:   { label: 'RDS',              desc: 'Managed relational DB: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server' },
      gcp:   { label: 'Cloud SQL',        desc: 'Managed MySQL, PostgreSQL, SQL Server with HA and replicas' },
      azure: { label: 'Azure SQL Database', desc: 'Intelligent managed SQL with auto-tuning and elastic pools' },
    },
    configSchema: [
      { key: 'engine', label: 'Engine', type: 'select', options: ['PostgreSQL 16', 'MySQL 8.4', 'MariaDB 11', 'Oracle 19c', 'SQL Server 2022'], default: 'PostgreSQL 16' },
      { key: 'instanceClass', label: 'Instance Class', type: 'select', options: [
        'db.t4g.micro', 'db.t4g.small', 'db.t4g.medium', 'db.t4g.large',
        'db.r7g.large', 'db.r7g.xlarge', 'db.r7g.2xlarge', 'db.r7g.4xlarge',
        'db.m7g.large', 'db.m7g.xlarge', 'db.m7g.2xlarge',
      ], default: 'db.r7g.large' },
      { key: 'storageGb', label: 'Storage (GB)', type: 'number', min: 20, max: 65536, default: 100 },
      { key: 'storageType', label: 'Storage Type', type: 'select', options: ['gp3', 'io2', 'magnetic'], default: 'gp3' },
      { key: 'multiAz', label: 'Multi-AZ', type: 'boolean', default: true },
      { key: 'readReplicas', label: 'Read Replicas', type: 'number', min: 0, max: 15, default: 1 },
      { key: 'backupRetention', label: 'Backup Retention (days)', type: 'number', min: 0, max: 35, default: 7 },
      { key: 'encryption', label: 'Encryption at Rest', type: 'boolean', default: true },
      { key: 'performanceInsights', label: 'Performance Insights', type: 'boolean', default: true },
    ],
  },
  {
    id: 'aurora',
    category: 'database',
    clouds: {
      aws:   { label: 'Aurora',                desc: 'MySQL/PostgreSQL-compatible, 5x/3x throughput, serverless v2' },
      gcp:   { label: 'AlloyDB',               desc: 'PostgreSQL-compatible with columnar engine and AI integration' },
      azure: { label: 'Cosmos DB (PostgreSQL)', desc: 'Globally distributed PostgreSQL with Citus sharding' },
    },
    configSchema: [
      { key: 'engine', label: 'Engine', type: 'select', options: ['Aurora PostgreSQL 16', 'Aurora MySQL 8.0'], default: 'Aurora PostgreSQL 16' },
      { key: 'serverless', label: 'Serverless v2', type: 'boolean', default: false },
      { key: 'minAcu', label: 'Min ACU (if serverless)', type: 'number', min: 0.5, max: 128, default: 0.5 },
      { key: 'maxAcu', label: 'Max ACU (if serverless)', type: 'number', min: 1, max: 256, default: 16 },
      { key: 'instanceClass', label: 'Instance (if provisioned)', type: 'select', options: ['db.r7g.large', 'db.r7g.xlarge', 'db.r7g.2xlarge', 'db.r7g.4xlarge', 'db.r7g.8xlarge'], default: 'db.r7g.xlarge' },
      { key: 'replicas', label: 'Read Replicas', type: 'number', min: 0, max: 15, default: 2 },
      { key: 'globalDatabase', label: 'Global Database', type: 'boolean', default: false },
      { key: 'backtracking', label: 'Backtrack (MySQL)', type: 'boolean', default: false },
    ],
  },
  {
    id: 'dynamodb',
    category: 'database',
    clouds: {
      aws:   { label: 'DynamoDB',         desc: 'Serverless NoSQL with single-digit ms latency at any scale' },
      gcp:   { label: 'Firestore',        desc: 'Serverless document DB with real-time sync and offline' },
      azure: { label: 'Cosmos DB (NoSQL)', desc: 'Globally distributed multi-model NoSQL with 5 consistency models' },
    },
    configSchema: [
      { key: 'capacityMode', label: 'Capacity Mode', type: 'select', options: ['On-Demand', 'Provisioned'], default: 'On-Demand' },
      { key: 'readCapacity', label: 'Read Capacity Units', type: 'number', min: 1, max: 40000, default: 100 },
      { key: 'writeCapacity', label: 'Write Capacity Units', type: 'number', min: 1, max: 40000, default: 100 },
      { key: 'globalTables', label: 'Global Tables', type: 'boolean', default: false },
      { key: 'dax', label: 'DAX Cache', type: 'boolean', default: false },
      { key: 'streams', label: 'DynamoDB Streams', type: 'boolean', default: false },
      { key: 'encryption', label: 'Encryption', type: 'select', options: ['AWS Owned', 'AWS Managed', 'Customer Managed (KMS)'], default: 'AWS Owned' },
      { key: 'pitr', label: 'Point-in-Time Recovery', type: 'boolean', default: true },
    ],
  },
  {
    id: 'elasticache',
    category: 'database',
    clouds: {
      aws:   { label: 'ElastiCache',          desc: 'Managed Redis 7 or Memcached with cluster mode' },
      gcp:   { label: 'Memorystore',          desc: 'Managed Redis 7 or Memcached with 99.9% SLA' },
      azure: { label: 'Azure Cache for Redis', desc: 'Managed Redis with Enterprise tier (RedisJSON, RediSearch)' },
    },
    configSchema: [
      { key: 'engine', label: 'Engine', type: 'select', options: ['Redis 7.2', 'Memcached 1.6', 'Valkey 8.0'], default: 'Redis 7.2' },
      { key: 'nodeType', label: 'Node Type', type: 'select', options: [
        'cache.t4g.micro', 'cache.t4g.small', 'cache.t4g.medium',
        'cache.r7g.large', 'cache.r7g.xlarge', 'cache.r7g.2xlarge',
        'cache.m7g.large', 'cache.m7g.xlarge',
      ], default: 'cache.r7g.large' },
      { key: 'numNodes', label: 'Nodes', type: 'number', min: 1, max: 90, default: 3 },
      { key: 'clusterMode', label: 'Cluster Mode', type: 'boolean', default: true },
      { key: 'multiAz', label: 'Multi-AZ', type: 'boolean', default: true },
      { key: 'encryption', label: 'Encryption in Transit', type: 'boolean', default: true },
    ],
  },
  {
    id: 'redshift',
    category: 'database',
    clouds: {
      aws:   { label: 'Redshift',             desc: 'Petabyte-scale data warehouse with serverless option' },
      gcp:   { label: 'BigQuery',             desc: 'Serverless data warehouse with ML and BI Engine' },
      azure: { label: 'Synapse Analytics',    desc: 'Unified analytics with dedicated/serverless SQL pools' },
    },
    configSchema: [
      { key: 'mode', label: 'Mode', type: 'select', options: ['Serverless', 'Provisioned'], default: 'Serverless' },
      { key: 'baseCapacity', label: 'Base RPU (serverless)', type: 'number', min: 8, max: 512, default: 32 },
      { key: 'nodeType', label: 'Node Type (provisioned)', type: 'select', options: ['ra3.xlplus', 'ra3.4xlarge', 'ra3.16xlarge'], default: 'ra3.xlplus' },
      { key: 'nodes', label: 'Nodes (provisioned)', type: 'number', min: 1, max: 128, default: 2 },
      { key: 'encryption', label: 'Encryption', type: 'boolean', default: true },
      { key: 'concurrencyScaling', label: 'Concurrency Scaling', type: 'boolean', default: false },
    ],
  },
  {
    id: 'neptune',
    category: 'database',
    clouds: {
      aws:   { label: 'Neptune',           desc: 'Graph database supporting Gremlin, SPARQL, openCypher' },
      gcp:   { label: 'Spanner Graph',     desc: 'Globally distributed graph with SQL interface' },
      azure: { label: 'Cosmos DB (Gremlin)', desc: 'Graph database API on Cosmos DB with global distribution' },
    },
    configSchema: [
      { key: 'instanceClass', label: 'Instance', type: 'select', options: ['db.r6g.large', 'db.r6g.xlarge', 'db.r6g.2xlarge', 'db.serverless'], default: 'db.r6g.large' },
      { key: 'replicas', label: 'Replicas', type: 'number', min: 0, max: 15, default: 1 },
      { key: 'queryLanguage', label: 'Query Language', type: 'select', options: ['Gremlin', 'SPARQL', 'openCypher'], default: 'openCypher' },
    ],
  },

  // ═══════════════════════ STORAGE ═══════════════════════
  {
    id: 's3',
    category: 'storage',
    clouds: {
      aws:   { label: 'S3',               desc: 'Object storage with 11 nines durability, intelligent tiering' },
      gcp:   { label: 'Cloud Storage',    desc: 'Object storage with auto-class, dual/multi-region' },
      azure: { label: 'Blob Storage',     desc: 'Massively scalable object storage with hot/cool/archive tiers' },
    },
    configSchema: [
      { key: 'storageClass', label: 'Storage Class', type: 'select', options: ['Standard', 'Intelligent-Tiering', 'Standard-IA', 'One Zone-IA', 'Glacier Instant', 'Glacier Flexible', 'Glacier Deep Archive'], default: 'Standard' },
      { key: 'versioning', label: 'Versioning', type: 'boolean', default: true },
      { key: 'encryption', label: 'Encryption', type: 'select', options: ['SSE-S3 (AES-256)', 'SSE-KMS', 'SSE-C'], default: 'SSE-S3 (AES-256)' },
      { key: 'replication', label: 'Cross-Region Replication', type: 'boolean', default: false },
      { key: 'lifecycle', label: 'Lifecycle Rules', type: 'boolean', default: true },
      { key: 'objectLock', label: 'Object Lock (WORM)', type: 'boolean', default: false },
      { key: 'accessLogging', label: 'Access Logging', type: 'boolean', default: false },
    ],
  },
  {
    id: 'efs',
    category: 'storage',
    clouds: {
      aws:   { label: 'EFS',              desc: 'Elastic file system, NFS v4, auto-scaling, multi-AZ' },
      gcp:   { label: 'Filestore',        desc: 'Managed NFS file storage with HDD and SSD tiers' },
      azure: { label: 'Azure Files',      desc: 'Managed SMB/NFS file shares with identity-based access' },
    },
    configSchema: [
      { key: 'performanceMode', label: 'Performance', type: 'select', options: ['General Purpose', 'Max I/O', 'Elastic'], default: 'General Purpose' },
      { key: 'throughputMode', label: 'Throughput', type: 'select', options: ['Bursting', 'Elastic', 'Provisioned'], default: 'Elastic' },
      { key: 'storageClass', label: 'Storage Class', type: 'select', options: ['Standard', 'Infrequent Access', 'One Zone', 'One Zone-IA'], default: 'Standard' },
      { key: 'encryption', label: 'Encryption', type: 'boolean', default: true },
    ],
  },
  {
    id: 'ebs',
    category: 'storage',
    clouds: {
      aws:   { label: 'EBS',              desc: 'Block storage volumes for EC2 with snapshots' },
      gcp:   { label: 'Persistent Disk',  desc: 'Block storage for VMs, regional persistent disks' },
      azure: { label: 'Managed Disks',    desc: 'Block storage for VMs with Ultra, Premium SSD, Standard tiers' },
    },
    configSchema: [
      { key: 'volumeType', label: 'Volume Type', type: 'select', options: ['gp3', 'gp2', 'io2', 'io2 Block Express', 'st1', 'sc1'], default: 'gp3' },
      { key: 'sizeGb', label: 'Size (GB)', type: 'number', min: 1, max: 65536, default: 100 },
      { key: 'iops', label: 'IOPS (io2/gp3)', type: 'number', min: 3000, max: 256000, default: 3000 },
      { key: 'throughput', label: 'Throughput (MiB/s)', type: 'number', min: 125, max: 4000, default: 125 },
      { key: 'encryption', label: 'Encryption', type: 'boolean', default: true },
      { key: 'snapshots', label: 'Automated Snapshots', type: 'boolean', default: true },
    ],
  },

  // ═══════════════════════ ANALYTICS ═══════════════════════
  {
    id: 'emr',
    category: 'analytics',
    clouds: {
      aws:   { label: 'EMR',              desc: 'Managed Spark/Hadoop/Hive/Presto with auto-scaling' },
      gcp:   { label: 'Dataproc',         desc: 'Managed Spark and Hadoop with autoscaling and Component Gateway' },
      azure: { label: 'HDInsight',        desc: 'Managed Hadoop, Spark, Kafka, HBase, Storm clusters' },
    },
    configSchema: [
      { key: 'framework', label: 'Framework', type: 'select', options: ['Spark 3.5', 'Hadoop 3.3', 'Hive 3', 'Presto', 'Flink 1.18'], default: 'Spark 3.5' },
      { key: 'masterType', label: 'Master Instance', type: 'select', options: ['m7g.xlarge', 'm7g.2xlarge', 'r7g.xlarge', 'r7g.2xlarge'], default: 'm7g.xlarge' },
      { key: 'coreCount', label: 'Core Nodes', type: 'number', min: 1, max: 100, default: 4 },
      { key: 'coreType', label: 'Core Instance', type: 'select', options: ['m7g.xlarge', 'm7g.2xlarge', 'r7g.xlarge', 'r7g.2xlarge', 'c7g.2xlarge'], default: 'r7g.xlarge' },
      { key: 'autoScaling', label: 'Auto Scaling', type: 'boolean', default: true },
      { key: 'spot', label: 'Spot/Preemptible Tasks', type: 'boolean', default: true },
    ],
  },
  {
    id: 'kinesis',
    category: 'analytics',
    clouds: {
      aws:   { label: 'Kinesis Data Streams', desc: 'Real-time data streaming with on-demand or provisioned mode' },
      gcp:   { label: 'Pub/Sub',              desc: 'Global real-time messaging with exactly-once delivery' },
      azure: { label: 'Event Hubs',           desc: 'Big data streaming with Kafka protocol support' },
    },
    configSchema: [
      { key: 'mode', label: 'Mode', type: 'select', options: ['On-Demand', 'Provisioned'], default: 'On-Demand' },
      { key: 'shards', label: 'Shards (provisioned)', type: 'number', min: 1, max: 10000, default: 4 },
      { key: 'retentionHours', label: 'Retention (hours)', type: 'number', min: 24, max: 8760, default: 168 },
      { key: 'enhancedFanOut', label: 'Enhanced Fan-Out', type: 'boolean', default: false },
      { key: 'encryption', label: 'Encryption', type: 'boolean', default: true },
    ],
  },
  {
    id: 'athena',
    category: 'analytics',
    clouds: {
      aws:   { label: 'Athena',           desc: 'Serverless SQL queries on S3 data, pay per query' },
      gcp:   { label: 'BigQuery',         desc: 'Serverless SQL analytics with BI Engine' },
      azure: { label: 'Synapse Serverless', desc: 'On-demand SQL queries over data lake' },
    },
    configSchema: [
      { key: 'engine', label: 'Engine', type: 'select', options: ['Trino', 'Spark'], default: 'Trino' },
      { key: 'workgroup', label: 'Workgroup', type: 'text', default: 'primary' },
      { key: 'scanLimit', label: 'Scan Limit (GB)', type: 'number', min: 0, max: 10000, default: 0 },
      { key: 'resultEncryption', label: 'Result Encryption', type: 'boolean', default: true },
    ],
  },
  {
    id: 'glue',
    category: 'analytics',
    clouds: {
      aws:   { label: 'Glue',             desc: 'Serverless ETL with Data Catalog, crawlers, and Spark jobs' },
      gcp:   { label: 'Dataflow',         desc: 'Unified stream and batch processing on Apache Beam' },
      azure: { label: 'Data Factory',     desc: 'Cloud ETL with 90+ connectors and mapping data flows' },
    },
    configSchema: [
      { key: 'jobType', label: 'Job Type', type: 'select', options: ['Spark ETL', 'Spark Streaming', 'Python Shell', 'Ray'], default: 'Spark ETL' },
      { key: 'workers', label: 'Max Workers', type: 'number', min: 2, max: 299, default: 10 },
      { key: 'workerType', label: 'Worker Type', type: 'select', options: ['G.1X (4 vCPU, 16GB)', 'G.2X (8 vCPU, 32GB)', 'G.4X (16 vCPU, 64GB)', 'G.8X (32 vCPU, 128GB)'], default: 'G.1X (4 vCPU, 16GB)' },
      { key: 'dataCatalog', label: 'Data Catalog', type: 'boolean', default: true },
    ],
  },

  // ═══════════════════════ AI / ML ═══════════════════════
  {
    id: 'sagemaker',
    category: 'ai_ml',
    clouds: {
      aws:   { label: 'SageMaker',        desc: 'Full ML lifecycle: build, train, deploy with Studio IDE' },
      gcp:   { label: 'Vertex AI',        desc: 'Unified ML platform with AutoML, training, and endpoints' },
      azure: { label: 'Azure ML',         desc: 'Enterprise ML with designer, AutoML, and MLOps' },
    },
    configSchema: [
      { key: 'instanceType', label: 'Training Instance', type: 'select', options: ['ml.m5.xlarge', 'ml.c5.2xlarge', 'ml.p3.2xlarge', 'ml.p4d.24xlarge', 'ml.g5.xlarge', 'ml.trn1.2xlarge'], default: 'ml.g5.xlarge' },
      { key: 'instanceCount', label: 'Training Instances', type: 'number', min: 1, max: 32, default: 1 },
      { key: 'endpointInstance', label: 'Endpoint Instance', type: 'select', options: ['ml.t3.medium', 'ml.m5.large', 'ml.c5.xlarge', 'ml.g5.xlarge', 'ml.inf2.xlarge'], default: 'ml.m5.large' },
      { key: 'autoScaling', label: 'Endpoint Auto Scaling', type: 'boolean', default: true },
      { key: 'spotTraining', label: 'Spot Training', type: 'boolean', default: true },
    ],
  },
  {
    id: 'bedrock',
    category: 'ai_ml',
    clouds: {
      aws:   { label: 'Bedrock',          desc: 'Foundation models API: Claude, Llama, Titan, Stable Diffusion' },
      gcp:   { label: 'Vertex AI (GenAI)', desc: 'Gemini, PaLM, Imagen, Codey via Model Garden' },
      azure: { label: 'Azure OpenAI',     desc: 'GPT-4, DALL-E, Whisper with enterprise security' },
    },
    configSchema: [
      { key: 'model', label: 'Model', type: 'select', options: ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'Llama 3.1 70B', 'Llama 3.1 405B', 'Titan Text', 'Stable Diffusion XL', 'Mistral Large'], default: 'Claude 3.5 Sonnet' },
      { key: 'provisionedThroughput', label: 'Provisioned Throughput', type: 'boolean', default: false },
      { key: 'guardrails', label: 'Guardrails', type: 'boolean', default: true },
      { key: 'knowledgeBase', label: 'Knowledge Base (RAG)', type: 'boolean', default: false },
      { key: 'fineTuning', label: 'Custom Fine-Tuning', type: 'boolean', default: false },
    ],
  },
  {
    id: 'comprehend',
    category: 'ai_ml',
    clouds: {
      aws:   { label: 'Comprehend',       desc: 'NLP: sentiment, entities, key phrases, language detection' },
      gcp:   { label: 'Natural Language',  desc: 'NLP: sentiment, entity, syntax, classification' },
      azure: { label: 'Language Service', desc: 'NLP: sentiment, NER, QA, summarization, translation' },
    },
    configSchema: [
      { key: 'features', label: 'Features', type: 'select', options: ['Sentiment', 'Entities', 'Key Phrases', 'Language Detection', 'PII Detection', 'Custom Classification'], default: 'Sentiment' },
      { key: 'realtime', label: 'Real-time Endpoint', type: 'boolean', default: false },
    ],
  },

  // ═══════════════════════ MESSAGING ═══════════════════════
  {
    id: 'sqs',
    category: 'messaging',
    clouds: {
      aws:   { label: 'SQS',              desc: 'Fully managed message queue with Standard and FIFO' },
      gcp:   { label: 'Cloud Tasks',      desc: 'Managed task queue for asynchronous work dispatch' },
      azure: { label: 'Queue Storage',    desc: 'Simple HTTP message queue for large-scale workloads' },
    },
    configSchema: [
      { key: 'queueType', label: 'Queue Type', type: 'select', options: ['Standard', 'FIFO'], default: 'Standard' },
      { key: 'visibilityTimeout', label: 'Visibility Timeout (sec)', type: 'number', min: 0, max: 43200, default: 30 },
      { key: 'retentionDays', label: 'Retention (days)', type: 'number', min: 1, max: 14, default: 4 },
      { key: 'dlq', label: 'Dead Letter Queue', type: 'boolean', default: true },
      { key: 'maxReceives', label: 'Max Receives (DLQ)', type: 'number', min: 1, max: 100, default: 3 },
      { key: 'encryption', label: 'Encryption', type: 'boolean', default: true },
    ],
  },
  {
    id: 'sns',
    category: 'messaging',
    clouds: {
      aws:   { label: 'SNS',              desc: 'Pub/sub messaging for fan-out, push notifications' },
      gcp:   { label: 'Pub/Sub Topics',   desc: 'Global pub/sub with ordering and schema validation' },
      azure: { label: 'Event Grid',       desc: 'Event routing with pub/sub and push delivery' },
    },
    configSchema: [
      { key: 'topicType', label: 'Topic Type', type: 'select', options: ['Standard', 'FIFO'], default: 'Standard' },
      { key: 'protocol', label: 'Subscription Protocol', type: 'select', options: ['HTTP/S', 'Email', 'SMS', 'SQS', 'Lambda', 'Kinesis'], default: 'SQS' },
      { key: 'encryption', label: 'Encryption', type: 'boolean', default: true },
      { key: 'filterPolicy', label: 'Filter Policy', type: 'boolean', default: false },
    ],
  },
  {
    id: 'eventbridge',
    category: 'messaging',
    clouds: {
      aws:   { label: 'EventBridge',      desc: 'Serverless event bus with schema registry and rules' },
      gcp:   { label: 'Eventarc',         desc: 'Event routing from Google services and custom sources' },
      azure: { label: 'Event Grid Topics', desc: 'Event routing with domains, system topics, partner events' },
    },
    configSchema: [
      { key: 'bus', label: 'Event Bus', type: 'select', options: ['Default', 'Custom'], default: 'Custom' },
      { key: 'schemaRegistry', label: 'Schema Registry', type: 'boolean', default: true },
      { key: 'archive', label: 'Event Archive', type: 'boolean', default: false },
      { key: 'replay', label: 'Event Replay', type: 'boolean', default: false },
    ],
  },
  {
    id: 'mq',
    category: 'messaging',
    clouds: {
      aws:   { label: 'Amazon MQ',        desc: 'Managed ActiveMQ and RabbitMQ brokers' },
      gcp:   { label: 'Confluent (Marketplace)', desc: 'Managed Apache Kafka on GCP marketplace' },
      azure: { label: 'Service Bus',      desc: 'Enterprise messaging with queues, topics, sessions' },
    },
    configSchema: [
      { key: 'engine', label: 'Engine', type: 'select', options: ['RabbitMQ', 'ActiveMQ'], default: 'RabbitMQ' },
      { key: 'instanceType', label: 'Instance', type: 'select', options: ['mq.t3.micro', 'mq.m5.large', 'mq.m5.xlarge', 'mq.m5.2xlarge'], default: 'mq.m5.large' },
      { key: 'deployment', label: 'Deployment', type: 'select', options: ['Single Instance', 'Active/Standby', 'Cluster'], default: 'Active/Standby' },
      { key: 'storageGb', label: 'Storage (GB)', type: 'number', min: 5, max: 200, default: 20 },
    ],
  },

  // ═══════════════════════ SECURITY ═══════════════════════
  {
    id: 'waf',
    category: 'security',
    clouds: {
      aws:   { label: 'WAF',              desc: 'Web Application Firewall with managed rules and bot control' },
      gcp:   { label: 'Cloud Armor',      desc: 'WAF and DDoS protection with adaptive protection' },
      azure: { label: 'Azure WAF',        desc: 'Web Application Firewall for App Gateway and Front Door' },
    },
    configSchema: [
      { key: 'rules', label: 'Managed Rule Groups', type: 'select', options: ['Core Rule Set', 'SQL Injection', 'XSS', 'Bot Control', 'IP Reputation', 'Anonymous IP'], default: 'Core Rule Set' },
      { key: 'rateLimit', label: 'Rate Limiting', type: 'boolean', default: true },
      { key: 'rateLimitRps', label: 'Rate Limit (rps)', type: 'number', min: 100, max: 100000, default: 2000 },
      { key: 'botControl', label: 'Bot Control', type: 'boolean', default: false },
      { key: 'logging', label: 'Logging', type: 'boolean', default: true },
    ],
  },
  {
    id: 'cognito',
    category: 'security',
    clouds: {
      aws:   { label: 'Cognito',          desc: 'User pools, identity pools, OAuth 2.0, SAML, social login' },
      gcp:   { label: 'Identity Platform', desc: 'User auth with multi-tenancy, blocking functions, SAML' },
      azure: { label: 'Entra ID (B2C)',   desc: 'Customer identity with social login, MFA, policies' },
    },
    configSchema: [
      { key: 'userPool', label: 'User Pool', type: 'boolean', default: true },
      { key: 'identityPool', label: 'Identity Pool', type: 'boolean', default: false },
      { key: 'mfa', label: 'MFA', type: 'select', options: ['OFF', 'Optional', 'Required'], default: 'Optional' },
      { key: 'socialProviders', label: 'Social Login', type: 'select', options: ['None', 'Google', 'Facebook', 'Apple', 'Amazon', 'SAML'], default: 'Google' },
      { key: 'advancedSecurity', label: 'Advanced Security', type: 'boolean', default: false },
    ],
  },
  {
    id: 'kms',
    category: 'security',
    clouds: {
      aws:   { label: 'KMS',              desc: 'Key management with automatic rotation, FIPS 140-2 L3' },
      gcp:   { label: 'Cloud KMS',        desc: 'Key management with HSM, external keys, autokey' },
      azure: { label: 'Key Vault',        desc: 'Secrets, keys, certificates management with HSM' },
    },
    configSchema: [
      { key: 'keyType', label: 'Key Type', type: 'select', options: ['Symmetric (AES-256)', 'Asymmetric (RSA)', 'Asymmetric (ECC)', 'HMAC'], default: 'Symmetric (AES-256)' },
      { key: 'rotation', label: 'Auto Rotation', type: 'boolean', default: true },
      { key: 'rotationDays', label: 'Rotation Period (days)', type: 'number', min: 90, max: 2560, default: 365 },
      { key: 'multiRegion', label: 'Multi-Region Key', type: 'boolean', default: false },
    ],
  },
  {
    id: 'secrets_mgr',
    category: 'security',
    clouds: {
      aws:   { label: 'Secrets Manager',  desc: 'Secret rotation, RDS integration, cross-account sharing' },
      gcp:   { label: 'Secret Manager',   desc: 'Secret versioning, IAM access control, replication' },
      azure: { label: 'Key Vault Secrets', desc: 'Secret management with soft-delete and purge protection' },
    },
    configSchema: [
      { key: 'autoRotation', label: 'Auto Rotation', type: 'boolean', default: true },
      { key: 'rotationDays', label: 'Rotation (days)', type: 'number', min: 1, max: 365, default: 30 },
      { key: 'replication', label: 'Cross-Region Replication', type: 'boolean', default: false },
    ],
  },

  // ═══════════════════════ MONITORING ═══════════════════════
  {
    id: 'cloudwatch',
    category: 'monitoring',
    clouds: {
      aws:   { label: 'CloudWatch',       desc: 'Metrics, logs, alarms, dashboards, Insights queries' },
      gcp:   { label: 'Cloud Monitoring', desc: 'Metrics, uptime checks, dashboards, SLO monitoring' },
      azure: { label: 'Azure Monitor',    desc: 'Metrics, logs, alerts, Application Insights, Workbooks' },
    },
    configSchema: [
      { key: 'detailedMonitoring', label: 'Detailed Monitoring', type: 'boolean', default: false },
      { key: 'logRetention', label: 'Log Retention (days)', type: 'select', options: ['1', '3', '7', '14', '30', '60', '90', '180', '365', 'Never Expire'], default: '30' },
      { key: 'alarms', label: 'Alarms', type: 'number', min: 0, max: 5000, default: 10 },
      { key: 'dashboards', label: 'Dashboards', type: 'number', min: 0, max: 1000, default: 2 },
      { key: 'containerInsights', label: 'Container Insights', type: 'boolean', default: false },
    ],
  },
  {
    id: 'xray',
    category: 'monitoring',
    clouds: {
      aws:   { label: 'X-Ray',            desc: 'Distributed tracing for microservices and serverless' },
      gcp:   { label: 'Cloud Trace',      desc: 'Distributed tracing with latency analysis' },
      azure: { label: 'App Insights',     desc: 'Application performance monitoring with distributed tracing' },
    },
    configSchema: [
      { key: 'samplingRate', label: 'Sampling Rate %', type: 'number', min: 1, max: 100, default: 5 },
      { key: 'groups', label: 'Trace Groups', type: 'number', min: 1, max: 25, default: 2 },
      { key: 'insights', label: 'X-Ray Insights', type: 'boolean', default: false },
    ],
  },
];

export default SERVICES;

// Cloud-specific config overrides: { serviceId: { cloud: { fieldKey: { options?, default?, label?, min?, max? } } } }
// When a cloud is selected, these override the base configSchema fields
export const CLOUD_CONFIG_OVERRIDES = {
  ec2: {
    gcp: {
      instanceType: {
        label: 'Machine Type',
        options: [
          'e2-micro', 'e2-small', 'e2-medium', 'e2-standard-2',
          'n2-standard-2', 'n2-standard-4', 'n2-standard-8', 'n2-standard-16',
          'c3-standard-4', 'c3-standard-8',
          'a2-highgpu-1g', 'g2-standard-4',
        ],
        default: 'n2-standard-4',
      },
      os: {
        label: 'OS Image',
        options: ['Debian 12', 'Ubuntu 24.04', 'Rocky Linux 9', 'Windows Server 2022', 'Container-Optimized OS', 'SLES 15'],
        default: 'Debian 12',
      },
      storageType: { label: 'Disk Type', options: ['pd-ssd', 'pd-balanced', 'pd-standard', 'pd-extreme'], default: 'pd-balanced' },
      storageGb: { label: 'Boot Disk (GB)' },
      spot: { label: 'Preemptible VM' },
    },
    azure: {
      instanceType: {
        label: 'VM Size',
        options: [
          'Standard_B1s', 'Standard_B2s', 'Standard_B2ms', 'Standard_B4ms',
          'Standard_D2s_v5', 'Standard_D4s_v5', 'Standard_D8s_v5', 'Standard_D16s_v5',
          'Standard_E2s_v5', 'Standard_E4s_v5',
          'Standard_NC6s_v3', 'Standard_NC4as_T4_v3',
        ],
        default: 'Standard_D4s_v5',
      },
      os: {
        label: 'OS Image',
        options: ['Ubuntu 24.04', 'Windows Server 2022', 'RHEL 9', 'Debian 12', 'SLES 15', 'CBL-Mariner 2.0'],
        default: 'Ubuntu 24.04',
      },
      storageType: { label: 'Disk Type', options: ['Premium SSD v2', 'Premium SSD', 'Standard SSD', 'Standard HDD', 'Ultra Disk'], default: 'Premium SSD' },
      storageGb: { label: 'OS Disk (GB)' },
      spot: { label: 'Spot VM' },
    },
  },
  rds: {
    gcp: {
      engine: { options: ['PostgreSQL 16', 'MySQL 8.4', 'SQL Server 2022'], default: 'PostgreSQL 16' },
      instanceClass: {
        label: 'Machine Type',
        options: [
          'db-f1-micro', 'db-g1-small', 'db-n1-standard-1', 'db-n1-standard-2',
          'db-n1-standard-4', 'db-n1-standard-8', 'db-n1-standard-16',
          'db-n1-highmem-2', 'db-n1-highmem-4', 'db-n1-highmem-8',
        ],
        default: 'db-n1-standard-2',
      },
      storageType: { label: 'Storage Type', options: ['SSD', 'HDD'], default: 'SSD' },
      performanceInsights: { label: 'Query Insights' },
    },
    azure: {
      engine: { options: ['PostgreSQL 16', 'MySQL 8.4', 'SQL Server 2022'], default: 'PostgreSQL 16' },
      instanceClass: {
        label: 'Compute Tier',
        options: [
          'Basic 1 vCore', 'Basic 2 vCores',
          'GP Standard_D2ds_v4', 'GP Standard_D4ds_v4', 'GP Standard_D8ds_v4',
          'BC Standard_E2ds_v4', 'BC Standard_E4ds_v4', 'BC Standard_E8ds_v4',
          'Hyperscale 2 vCores', 'Hyperscale 4 vCores',
        ],
        default: 'GP Standard_D4ds_v4',
      },
      storageType: { label: 'Storage Type', options: ['Premium SSD', 'Standard SSD'], default: 'Premium SSD' },
      performanceInsights: { label: 'Intelligent Performance' },
    },
  },
  ecs: {
    gcp: {
      launchType: { label: 'Execution Environment', options: ['Fully Managed', 'GKE'], default: 'Fully Managed' },
      serviceConnect: { label: 'VPC Connector' },
    },
    azure: {
      launchType: { label: 'Environment Type', options: ['Consumption', 'Dedicated'], default: 'Consumption' },
      serviceConnect: { label: 'Dapr Enabled' },
    },
  },
  eks: {
    gcp: {
      nodeType: { label: 'Mode', options: ['Autopilot', 'Standard'], default: 'Autopilot' },
      instanceType: {
        label: 'Node Machine Type',
        options: ['e2-medium', 'e2-standard-2', 'n2-standard-2', 'n2-standard-4', 'n2-standard-8', 'c3-standard-4'],
        default: 'n2-standard-4',
      },
      logging: { label: 'Cloud Logging' },
    },
    azure: {
      nodeType: { label: 'Node Pool Type', options: ['System', 'User', 'Virtual'], default: 'System' },
      instanceType: {
        label: 'Node VM Size',
        options: ['Standard_DS2_v2', 'Standard_D4s_v5', 'Standard_D8s_v5', 'Standard_E4s_v5', 'Standard_NC6s_v3'],
        default: 'Standard_D4s_v5',
      },
      logging: { label: 'Azure Monitor' },
    },
  },
  lambda: {
    gcp: {
      runtime: { options: ['Node.js 22', 'Python 3.13', 'Java 21', 'Go 1.22', '.NET 8', 'Ruby 3.3', 'PHP 8.3'], default: 'Node.js 22' },
      snapStart: { label: 'Min Instances' },
      provisionedConcurrency: { label: 'Min Instances', min: 0, max: 100, default: 0 },
      ephemeralStorage: { label: 'Tmp Storage (MB)' },
    },
    azure: {
      runtime: { options: ['Node.js 22', 'Python 3.13', 'Java 21', '.NET 8', 'PowerShell 7.4', 'Custom Handler'], default: '.NET 8' },
      snapStart: { label: 'Always Ready Instances' },
      ephemeralStorage: { label: 'Temp Storage (MB)' },
    },
  },
  s3: {
    gcp: {
      storageClass: {
        options: ['Standard', 'Nearline', 'Coldline', 'Archive', 'Autoclass'],
        default: 'Standard',
      },
      encryption: { options: ['Google-managed', 'Cloud KMS', 'Customer-supplied'], default: 'Google-managed' },
      replication: { label: 'Multi-Region / Dual-Region' },
    },
    azure: {
      storageClass: {
        label: 'Access Tier',
        options: ['Hot', 'Cool', 'Cold', 'Archive'],
        default: 'Hot',
      },
      encryption: { options: ['Microsoft-managed', 'Customer-managed (Key Vault)'], default: 'Microsoft-managed' },
      replication: { label: 'Geo-Redundant Replication' },
    },
  },
  dynamodb: {
    gcp: {
      capacityMode: { label: 'Mode', options: ['Native', 'Datastore'], default: 'Native' },
      readCapacity: { label: 'Max Read Ops/sec' },
      writeCapacity: { label: 'Max Write Ops/sec' },
      dax: { label: 'Memcache Integration' },
      streams: { label: 'Change Streams' },
      encryption: { options: ['Google-managed', 'Cloud KMS'], default: 'Google-managed' },
      pitr: { label: 'Point-in-Time Recovery' },
    },
    azure: {
      capacityMode: { label: 'Throughput Mode', options: ['Serverless', 'Autoscale', 'Manual'], default: 'Serverless' },
      readCapacity: { label: 'Max RU/s (read)' },
      writeCapacity: { label: 'Max RU/s (write)' },
      dax: { label: 'Integrated Cache' },
      streams: { label: 'Change Feed' },
      encryption: { options: ['Service-managed', 'Customer-managed (Key Vault)'], default: 'Service-managed' },
      globalTables: { label: 'Multi-Region Writes' },
    },
  },
  elasticache: {
    gcp: {
      engine: { label: 'Tier', options: ['Basic', 'Standard', 'Redis Cluster'], default: 'Standard' },
      nodeType: {
        label: 'Tier Capacity',
        options: ['M1 (1GB)', 'M2 (4GB)', 'M3 (10GB)', 'M4 (35GB)', 'M5 (100GB)'],
        default: 'M3 (10GB)',
      },
    },
    azure: {
      engine: { label: 'Tier', options: ['Basic', 'Standard', 'Premium', 'Enterprise', 'Enterprise Flash'], default: 'Premium' },
      nodeType: {
        label: 'Cache Size',
        options: ['C0 (250MB)', 'C1 (1GB)', 'C2 (2.5GB)', 'C3 (6GB)', 'P1 (6GB)', 'P2 (13GB)', 'P3 (26GB)', 'P4 (53GB)'],
        default: 'P1 (6GB)',
      },
    },
  },
  sagemaker: {
    gcp: {
      instanceType: {
        label: 'Training Machine',
        options: ['n1-standard-4', 'n1-standard-8', 'n1-highmem-8', 'a2-highgpu-1g', 'a2-highgpu-2g'],
        default: 'a2-highgpu-1g',
      },
      endpointInstance: {
        label: 'Endpoint Machine',
        options: ['n1-standard-2', 'n1-standard-4', 'n1-highmem-4', 'a2-highgpu-1g'],
        default: 'n1-standard-4',
      },
    },
    azure: {
      instanceType: {
        label: 'Training VM',
        options: ['Standard_DS3_v2', 'Standard_NC6s_v3', 'Standard_NC12s_v3', 'Standard_ND40rs_v2'],
        default: 'Standard_NC6s_v3',
      },
      endpointInstance: {
        label: 'Endpoint VM',
        options: ['Standard_DS2_v2', 'Standard_DS3_v2', 'Standard_NC6s_v3'],
        default: 'Standard_DS2_v2',
      },
    },
  },
  bedrock: {
    gcp: {
      model: {
        options: ['Gemini 1.5 Pro', 'Gemini 1.5 Flash', 'PaLM 2', 'Imagen 2', 'Codey', 'Chirp'],
        default: 'Gemini 1.5 Pro',
      },
      provisionedThroughput: { label: 'Provisioned Throughput' },
      guardrails: { label: 'Safety Filters' },
      knowledgeBase: { label: 'Grounding (RAG)' },
      fineTuning: { label: 'Model Tuning' },
    },
    azure: {
      model: {
        options: ['GPT-4o', 'GPT-4 Turbo', 'GPT-3.5 Turbo', 'DALL-E 3', 'Whisper', 'Text Embedding 3'],
        default: 'GPT-4o',
      },
      provisionedThroughput: { label: 'Provisioned Throughput Units' },
      guardrails: { label: 'Content Filtering' },
      knowledgeBase: { label: 'On Your Data (RAG)' },
      fineTuning: { label: 'Fine-Tuning' },
    },
  },
  ebs: {
    gcp: {
      volumeType: { label: 'Disk Type', options: ['pd-ssd', 'pd-balanced', 'pd-standard', 'pd-extreme', 'hyperdisk-extreme', 'hyperdisk-balanced'], default: 'pd-balanced' },
      iops: { label: 'Provisioned IOPS' },
    },
    azure: {
      volumeType: { label: 'Disk Type', options: ['Premium SSD v2', 'Premium SSD', 'Standard SSD', 'Standard HDD', 'Ultra Disk'], default: 'Premium SSD' },
      iops: { label: 'Provisioned IOPS' },
    },
  },
  emr: {
    gcp: {
      masterType: {
        label: 'Master Machine',
        options: ['n2-standard-2', 'n2-standard-4', 'n2-highmem-4', 'n2-highmem-8'],
        default: 'n2-standard-4',
      },
      coreType: {
        label: 'Worker Machine',
        options: ['n2-standard-4', 'n2-standard-8', 'n2-highmem-4', 'n2-highmem-8', 'c3-standard-8'],
        default: 'n2-highmem-4',
      },
      spot: { label: 'Preemptible Workers' },
    },
    azure: {
      masterType: {
        label: 'Head Node',
        options: ['Standard_D4s_v5', 'Standard_D8s_v5', 'Standard_E4s_v5', 'Standard_E8s_v5'],
        default: 'Standard_D4s_v5',
      },
      coreType: {
        label: 'Worker Node',
        options: ['Standard_D4s_v5', 'Standard_D8s_v5', 'Standard_E4s_v5', 'Standard_E8s_v5'],
        default: 'Standard_E4s_v5',
      },
      spot: { label: 'Spot Workers' },
    },
  },
  mq: {
    gcp: {
      engine: { label: 'Engine', options: ['Apache Kafka', 'Confluent Platform'], default: 'Apache Kafka' },
      instanceType: {
        label: 'Machine Type',
        options: ['n2-standard-2', 'n2-standard-4', 'n2-standard-8'],
        default: 'n2-standard-4',
      },
    },
    azure: {
      engine: { label: 'Tier', options: ['Basic', 'Standard', 'Premium'], default: 'Standard' },
      instanceType: {
        label: 'Messaging Units',
        options: ['1 Unit', '2 Units', '4 Units', '8 Units', '16 Units'],
        default: '1 Unit',
      },
    },
  },
};

// Helper: get service by id
export function getService(id) {
  return SERVICES.find(s => s.id === id);
}

// Helper: get services by category
export function getServicesByCategory(category) {
  return SERVICES.filter(s => s.category === category);
}

// Helper: get all category IDs
export function getCategoryIds() {
  return Object.keys(CATEGORIES);
}

// Helper: get cloud label for a service
export function getCloudLabel(serviceId, cloud) {
  const svc = getService(serviceId);
  return svc?.clouds[cloud]?.label || serviceId;
}

// Helper: get cloud description for a service
export function getCloudDesc(serviceId, cloud) {
  const svc = getService(serviceId);
  return svc?.clouds[cloud]?.desc || '';
}

// Helper: get cloud-specific config schema for a service
export function getCloudConfigSchema(serviceId, cloud) {
  const svc = getService(serviceId);
  if (!svc) return [];
  const overrides = CLOUD_CONFIG_OVERRIDES[serviceId]?.[cloud];
  if (!overrides) return svc.configSchema;

  return svc.configSchema.map(field => {
    const override = overrides[field.key];
    if (!override) return field;
    return { ...field, ...override };
  });
}
