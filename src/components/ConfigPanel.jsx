import { CATEGORIES, getService, getCloudLabel, getCloudDesc } from '../data/catalog';

export default function ConfigPanel({ node, cloud, onUpdateConfig, onRemove }) {
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

      <div className="config-section">
        <h4 className="config-section-title">Configuration</h4>

        {service.configSchema.map(field => (
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
