const PRESETS = [
  { name: 'Idle',   traffic: 0,   throughput: 0,  users: 0 },
  { name: 'Normal', traffic: 30,  throughput: 25, users: 20 },
  { name: 'Peak',   traffic: 65,  throughput: 55, users: 60 },
  { name: 'Stress', traffic: 85,  throughput: 80, users: 90 },
  { name: 'DDoS',   traffic: 100, throughput: 95, users: 100 },
];

export default function TrafficPanel({ sliders, setSliders, open, onToggle, cloudColor }) {
  const handleSlider = (key, val) => {
    setSliders(prev => ({ ...prev, [key]: Number(val) }));
  };

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

          {/* Sliders */}
          <div className="traffic-slider-group">
            <div className="traffic-slider-row">
              <label>Requests / sec</label>
              <span className="traffic-val">{sliders.traffic}%</span>
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
              <span className="traffic-val">{sliders.throughput}%</span>
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
              <span className="traffic-val">{sliders.users}%</span>
            </div>
            <input
              type="range" min="0" max="100"
              value={sliders.users}
              onChange={e => handleSlider('users', e.target.value)}
              className="traffic-range"
              style={{ '--accent': cloudColor }}
            />
          </div>

          {/* Legend */}
          <div className="traffic-legend">
            <span><span className="tl-dot" style={{ background: '#4ade80' }} /> 0–70%</span>
            <span><span className="tl-dot" style={{ background: '#facc15' }} /> 70–90%</span>
            <span><span className="tl-dot" style={{ background: '#ef4444' }} /> 90%+</span>
          </div>
        </div>
      )}
    </div>
  );
}
