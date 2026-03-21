import { CATEGORIES, getService, getCloudLabel, getCloudDesc, getCloudConfigSchema } from '../data/catalog';
import { computeNodeLoad, getMaxRps, getLoadColor, getStatusLabel, formatRps } from '../data/traffic';

export default function ConfigPanel({ node, cloud, sliders, onUpdateConfig, onRemove }) {
  if (!node) {
    return (
      <div className="config-panel">
        <div className="config-empty">
          <p>Select a component to configure it</p>
          <p className="config-hint">Click any component on the canvas, or add one from the palette</p>
        </div>
      </div>
    );
  }

  const service = getService(node.serviceId);
  if (!service) return null;

  const catColor = CATEGORIES[node.category]?.color || '#888';
  const catIcon = CATEGORIES[node.category]?.icon || '';
  const label = getCloudLabel(node.serviceId, cloud);
  const desc = getCloudDesc(node.serviceId, cloud);

  const loadPct = computeNodeLoad(node.serviceId, node.category, sliders);
  const maxRps = getMaxRps(node.serviceId);
  const currentRps = Math.round(maxRps * loadPct);
  const loadColor = getLoadColor(loadPct);
  const status = getStatusLabel(loadPct);

  return (
    <div className="config-panel">
      <div className="config-header" style={{ borderColor: catColor }}>
        <div className="config-title-row">
          <span className="config-icon">{catIcon}</span>
          <div>
            <h3 className="config-title">{label}</h3>
            <span className="config-cloud">{cloud.toUpperCase()}</span>
          </div>
        </div>
        <p className="config-desc">{desc}</p>
        <button className="config-remove" onClick={() => onRemove(node.id)} title="Remove component">
          &#x2715; Remove
        </button>
      </div>

      {/* Traffic stats */}
      <div className="config-section">
        <h4 className="config-section-title">Traffic Status</h4>
        <div className="config-stats">
          <div className="config-stat">
            <span className="config-stat-label">Status</span>
            <span className="config-stat-value">{status.emoji} {status.label}</span>
          </div>
          <div className="config-stat">
            <span className="config-stat-label">Current Load</span>
            <span className="config-stat-value" style={{ color: loadColor }}>
              {formatRps(currentRps)} rps
            </span>
          </div>
          <div className="config-stat">
            <span className="config-stat-label">Max Capacity</span>
            <span className="config-stat-value">
              {formatRps(maxRps)} rps
            </span>
          </div>
          <div className="config-stat">
            <span className="config-stat-label">Utilization</span>
            <span className="config-stat-value" style={{ color: loadColor }}>
              {Math.round(loadPct * 100)}%
            </span>
          </div>
        </div>
        {/* Mini load bar */}
        <div className="config-loadbar-bg">
          <div
            className="config-loadbar-fill"
            style={{ width: `${Math.round(loadPct * 100)}%`, background: loadColor, transition: 'all 0.4s ease' }}
          />
        </div>
      </div>

      <div className="config-section">
        <h4 className="config-section-title">Configuration</h4>

        {getCloudConfigSchema(node.serviceId, cloud).map(field => (
          <div key={field.key} className="config-field">
            <label className="config-field-label">{field.label}</label>

            {field.type === 'select' && (
              <select
                className="config-input config-select"
                value={node.config[field.key] ?? field.default}
                onChange={e => onUpdateConfig(node.id, field.key, e.target.value)}
              >
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {field.type === 'number' && (
              <input
                type="number"
                className="config-input config-number"
                value={node.config[field.key] ?? field.default}
                min={field.min}
                max={field.max}
                onChange={e => onUpdateConfig(node.id, field.key, Number(e.target.value))}
              />
            )}

            {field.type === 'boolean' && (
              <label className="config-toggle">
                <input
                  type="checkbox"
                  checked={node.config[field.key] ?? field.default}
                  onChange={e => onUpdateConfig(node.id, field.key, e.target.checked)}
                />
                <span className="config-toggle-slider" style={{ '--toggle-color': catColor }} />
                <span className="config-toggle-label">
                  {(node.config[field.key] ?? field.default) ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            )}

            {field.type === 'text' && (
              <input
                type="text"
                className="config-input config-text"
                value={node.config[field.key] ?? field.default}
                onChange={e => onUpdateConfig(node.id, field.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="config-section">
        <h4 className="config-section-title">Position</h4>
        <div className="config-pos">
          <span>X: {Math.round(node.x)}</span>
          <span>Y: {Math.round(node.y)}</span>
        </div>
      </div>
    </div>
  );
}
