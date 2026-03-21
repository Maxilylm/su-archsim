import { CLOUDS } from '../data/clouds';

const PRESETS = [
  { name: 'Idle', traffic: 0, throughput: 0, users: 0 },
  { name: 'Normal', traffic: 30, throughput: 25, users: 20 },
  { name: 'Peak', traffic: 65, throughput: 55, users: 60 },
  { name: 'Stress', traffic: 85, throughput: 80, users: 90 },
  { name: 'DDoS', traffic: 100, throughput: 95, users: 100 },
];

export default function Controls({ cloud, setCloud, sliders, setSliders }) {
  const handleSlider = (key, val) => {
    setSliders((prev) => ({ ...prev, [key]: Number(val) }));
  };

  return (
    <div className="controls">
      {/* Cloud selector */}
      <div className="control-section">
        <label className="control-label">Cloud Provider</label>
        <div className="cloud-buttons">
          {Object.entries(CLOUDS).map(([key, c]) => (
            <button
              key={key}
              className={`cloud-btn ${cloud === key ? 'active' : ''}`}
              style={{
                borderColor: cloud === key ? c.color : 'rgba(255,255,255,0.15)',
                color: cloud === key ? c.color : 'rgba(255,255,255,0.5)',
                background: cloud === key ? `${c.color}15` : 'transparent',
              }}
              onClick={() => setCloud(key)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div className="control-section">
        <label className="control-label">Load Presets</label>
        <div className="preset-buttons">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              className="preset-btn"
              onClick={() => setSliders({ traffic: p.traffic, throughput: p.throughput, users: p.users })}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="control-section">
        <label className="control-label">
          Requests / sec
          <span className="slider-value">{sliders.traffic}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={sliders.traffic}
          onChange={(e) => handleSlider('traffic', e.target.value)}
          className="slider"
          style={{ '--accent': CLOUDS[cloud].color }}
        />
      </div>

      <div className="control-section">
        <label className="control-label">
          Data Throughput
          <span className="slider-value">{sliders.throughput}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={sliders.throughput}
          onChange={(e) => handleSlider('throughput', e.target.value)}
          className="slider"
          style={{ '--accent': CLOUDS[cloud].color }}
        />
      </div>

      <div className="control-section">
        <label className="control-label">
          Concurrent Users
          <span className="slider-value">{sliders.users}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={sliders.users}
          onChange={(e) => handleSlider('users', e.target.value)}
          className="slider"
          style={{ '--accent': CLOUDS[cloud].color }}
        />
      </div>

      {/* Legend */}
      <div className="control-section" style={{ marginTop: '12px' }}>
        <label className="control-label">Health Legend</label>
        <div className="legend">
          <span><span className="dot" style={{ background: '#4ade80' }} /> 0-70%</span>
          <span><span className="dot" style={{ background: '#facc15' }} /> 70-90%</span>
          <span><span className="dot" style={{ background: '#ef4444' }} /> 90%+</span>
        </div>
      </div>
    </div>
  );
}
