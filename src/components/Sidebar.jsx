import { CLOUDS } from '../data/clouds';

export default function Sidebar({ cloud, selected, components, loads }) {
  const comp = selected ? components[selected] : null;
  const load = selected ? (loads[selected] || 0) : 0;

  return (
    <div className="sidebar">
      <h3 style={{ color: CLOUDS[cloud].color, margin: '0 0 16px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>
        Component Details
      </h3>

      {!selected ? (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
          Click a component on the diagram to inspect it.
        </p>
      ) : (
        <div className="detail-card">
          <div className="detail-label">{CLOUDS[cloud].name}</div>
          <h2 style={{ margin: '4px 0 12px', fontSize: '18px', color: '#fff' }}>{comp.label}</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: '1.5', margin: '0 0 16px' }}>
            {comp.desc}
          </p>

          <div className="stat-grid">
            <div className="stat">
              <span className="stat-label">Current Load</span>
              <span className="stat-value" style={{ color: load / comp.maxRps > 0.8 ? '#ff4444' : '#4ade80' }}>
                {load >= 1000 ? `${(load / 1000).toFixed(1)}k` : load} rps
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Max Capacity</span>
              <span className="stat-value">
                {comp.maxRps >= 1000 ? `${(comp.maxRps / 1000).toFixed(0)}k` : comp.maxRps} rps
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Utilization</span>
              <span className="stat-value" style={{ color: load / comp.maxRps > 0.8 ? '#ff4444' : '#4ade80' }}>
                {Math.round((load / comp.maxRps) * 100)}%
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Status</span>
              <span className="stat-value">
                {load / comp.maxRps > 0.9 ? '🔴 Critical' :
                 load / comp.maxRps > 0.7 ? '🟡 Warning' :
                 load / comp.maxRps > 0.1 ? '🟢 Healthy' : '⚪ Idle'}
              </span>
            </div>
          </div>

          {/* Specs table per cloud */}
          <div style={{ marginTop: '16px' }}>
            <div className="detail-label" style={{ marginBottom: '8px' }}>Cloud-Specific Specs</div>
            <table className="spec-table">
              <tbody>
                {cloud === 'aws' && selected === 'lb' && (
                  <>
                    <tr><td>Type</td><td>ALB (L7) / NLB (L4)</td></tr>
                    <tr><td>Zones</td><td>Multi-AZ automatic</td></tr>
                    <tr><td>Pricing</td><td>$0.0225/hr + LCU</td></tr>
                  </>
                )}
                {cloud === 'gcp' && selected === 'lb' && (
                  <>
                    <tr><td>Type</td><td>Global external L7</td></tr>
                    <tr><td>Scope</td><td>Cross-region anycast</td></tr>
                    <tr><td>Pricing</td><td>5 rules free + $0.025/hr</td></tr>
                  </>
                )}
                {cloud === 'azure' && selected === 'lb' && (
                  <>
                    <tr><td>Type</td><td>Standard SKU (L4)</td></tr>
                    <tr><td>Zones</td><td>Zone-redundant</td></tr>
                    <tr><td>Pricing</td><td>$0.025/hr + rules</td></tr>
                  </>
                )}
                {selected === 'compute' && (
                  <>
                    <tr><td>Type</td><td>{cloud === 'aws' ? 'EC2 m7g.xlarge' : cloud === 'gcp' ? 'n2-standard-4' : 'D4s_v5'}</td></tr>
                    <tr><td>vCPUs</td><td>4</td></tr>
                    <tr><td>RAM</td><td>16 GB</td></tr>
                  </>
                )}
                {selected === 'db' && (
                  <>
                    <tr><td>Engine</td><td>{cloud === 'aws' ? 'Aurora PostgreSQL' : cloud === 'gcp' ? 'Cloud SQL Postgres' : 'Azure SQL Hyperscale'}</td></tr>
                    <tr><td>Storage</td><td>Auto-scaling</td></tr>
                    <tr><td>Replicas</td><td>{cloud === 'aws' ? '15 read replicas' : cloud === 'gcp' ? '10 read replicas' : '4 HA replicas'}</td></tr>
                  </>
                )}
                {selected === 'cache' && (
                  <>
                    <tr><td>Engine</td><td>Redis 7.x</td></tr>
                    <tr><td>Node</td><td>{cloud === 'aws' ? 'cache.r7g.xlarge' : cloud === 'gcp' ? 'M1 16GB' : 'P3 26GB'}</td></tr>
                    <tr><td>Mode</td><td>Cluster</td></tr>
                  </>
                )}
                {selected === 'emr' && (
                  <>
                    <tr><td>Framework</td><td>{cloud === 'aws' ? 'Spark 3.5 on EMR 7' : cloud === 'gcp' ? 'Spark 3.5 on Dataproc' : 'Spark 3.3 on HDInsight'}</td></tr>
                    <tr><td>Nodes</td><td>Auto-scaling 2-50</td></tr>
                    <tr><td>Storage</td><td>{cloud === 'aws' ? 'S3 + HDFS' : cloud === 'gcp' ? 'GCS + HDFS' : 'ADLS + HDFS'}</td></tr>
                  </>
                )}
                {!['lb', 'compute', 'db', 'cache', 'emr'].includes(selected) && (
                  <>
                    <tr><td>Region</td><td>us-east-1</td></tr>
                    <tr><td>Tier</td><td>Production</td></tr>
                    <tr><td>HA</td><td>Multi-zone</td></tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
