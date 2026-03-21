import { useState } from 'react';

const PRESETS = [
  { name: 'Idle',   traffic: 0,   throughput: 0,  users: 0 },
  { name: 'Normal', traffic: 30,  throughput: 25, users: 20 },
  { name: 'Peak',   traffic: 65,  throughput: 55, users: 60 },
  { name: 'Stress', traffic: 85,  throughput: 80, users: 90 },
  { name: 'DDoS',   traffic: 100, throughput: 95, users: 100 },
];

// Map slider % to approximate absolute numbers
function toAbsoluteRps(pct) {
  if (pct === 0) return 0;
  // Exponential scale: 0% -> 0, 50% -> ~5k, 100% -> ~100k
  return Math.round(Math.pow(pct / 100, 2) * 100000);
}
function toAbsoluteUsers(pct) {
  if (pct === 0) return 0;
  return Math.round(Math.pow(pct / 100, 2) * 50000);
}
function toAbsoluteThroughput(pct) {
  if (pct === 0) return 0;
  // MB/s
  return Math.round(Math.pow(pct / 100, 2) * 10000);
}
function formatNum(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function TrafficPanel({ sliders, setSliders, open, onToggle, cloudColor }) {
  const [showAbsolute, setShowAbsolute] = useState(true);

  const handleSlider = (key, val) => {
    setSliders(prev => ({ ...prev, [key]: Number(val) }));
  };

  const absRps = toAbsoluteRps(sliders.traffic);
  const absUsers = toAbsoluteUsers(sliders.users);
  const absThroughput = toAbsoluteThroughput(sliders.throughput);

  return (
    <div className={`traffic-panel ${open ? 'open' : ''}`}>
      <button className="traffic-toggle" onClick={onToggle} style={{ borderColor: open ? cloudColor : undefined }}>
        <span className="traffic-toggle-icon">📊</span>
        <span>Traffic Simulation</span>
        <span className={`traffic-arrow ${open ? 'open' : ''}`}>&#9656;</span>
      </button>

      {open && (
        <div className="traffic-body">
          {/* Presets */}
          <div className="traffic-presets">
            {PRESETS.map(p => (
              <button
                key={p.name}
                className="traffic-preset"
                onClick={() => setSliders({ traffic: p.traffic, throughput: p.throughput, users: p.users })}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Traffic summary */}
          {showAbsolute && sliders.traffic > 0 && (
            <div className="traffic-summary">
              <div className="traffic-summary-item">
                <span className="traffic-summary-value" style={{ color: cloudColor }}>{formatNum(absRps)}</span>
                <span className="traffic-summary-label">req/s</span>
              </div>
              <div className="traffic-summary-item">
                <span className="traffic-summary-value" style={{ color: cloudColor }}>{formatNum(absThroughput)}</span>
                <span className="traffic-summary-label">MB/s</span>
              </div>
              <div className="traffic-summary-item">
                <span className="traffic-summary-value" style={{ color: cloudColor }}>{formatNum(absUsers)}</span>
                <span className="traffic-summary-label">users</span>
              </div>
            </div>
          )}

          {/* Sliders */}
          <div className="traffic-slider-group">
            <div className="traffic-slider-row">
              <label>Requests / sec</label>
              <span className="traffic-val">
                {showAbsolute && sliders.traffic > 0 ? formatNum(absRps) : `${sliders.traffic}%`}
              </span>
            </div>
            <input
              type="range" min="0" max="100"
              value={sliders.traffic}
              onChange={e => handleSlider('traffic', e.target.value)}
              className="traffic-range"
              style={{ '--accent': cloudColor }}
            />
          </div>

          <div className="traffic-slider-group">
            <div className="traffic-slider-row">
              <label>Data Throughput</label>
              <span className="traffic-val">
                {showAbsolute && sliders.throughput > 0 ? `${formatNum(absThroughput)} MB/s` : `${sliders.throughput}%`}
              </span>
            </div>
            <input
              type="range" min="0" max="100"
              value={sliders.throughput}
              onChange={e => handleSlider('throughput', e.target.value)}
              className="traffic-range"
              style={{ '--accent': cloudColor }}
            />
          </div>

          <div className="traffic-slider-group">
            <div className="traffic-slider-row">
              <label>Concurrent Users</label>
              <span className="traffic-val">
                {showAbsolute && sliders.users > 0 ? formatNum(absUsers) : `${sliders.users}%`}
              </span>
            </div>
            <input
              type="range" min="0" max="100"
              value={sliders.users}
              onChange={e => handleSlider('users', e.target.value)}
              className="traffic-range"
              style={{ '--accent': cloudColor }}
            />
          </div>

          {/* Display toggle */}
          <div className="traffic-pattern-section">
            <div className="traffic-slider-row">
              <label>Display</label>
              <button
                className="traffic-abs-toggle"
                onClick={() => setShowAbsolute(p => !p)}
                title="Toggle absolute / percentage"
              >
                {showAbsolute ? 'ABS' : '%'}
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="traffic-legend">
            <span><span className="tl-dot" style={{ background: '#4ade80' }} /> 0-70%</span>
            <span><span className="tl-dot" style={{ background: '#facc15' }} /> 70-90%</span>
            <span><span className="tl-dot" style={{ background: '#ef4444' }} /> 90%+</span>
          </div>
        </div>
      )}
    </div>
  );
}
