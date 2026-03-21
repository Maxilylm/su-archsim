import { useState, useMemo } from 'react';
import { CLOUDS, LAYOUT, CONNECTIONS } from './data/clouds';
import ArchNode from './components/ArchNode';
import Connection from './components/Connection';
import Controls from './components/Controls';
import Sidebar from './components/Sidebar';
import './App.css';

function computeLoads(cloud, sliders) {
  const comps = CLOUDS[cloud].components;
  const loads = {};

  const weights = {
    dns:       { traffic: 0.9, throughput: 0.1, users: 0.8 },
    cdn:       { traffic: 0.8, throughput: 0.7, users: 0.6 },
    lb:        { traffic: 1.0, throughput: 0.3, users: 0.9 },
    gateway:   { traffic: 0.9, throughput: 0.2, users: 0.7 },
    compute:   { traffic: 0.7, throughput: 0.5, users: 1.0 },
    functions: { traffic: 0.6, throughput: 0.3, users: 0.5 },
    emr:       { traffic: 0.2, throughput: 1.0, users: 0.1 },
    cache:     { traffic: 0.8, throughput: 0.4, users: 0.9 },
    db:        { traffic: 0.6, throughput: 0.8, users: 0.7 },
    queue:     { traffic: 0.5, throughput: 0.6, users: 0.3 },
    storage:   { traffic: 0.3, throughput: 1.0, users: 0.2 },
    stream:    { traffic: 0.4, throughput: 0.9, users: 0.2 },
  };

  for (const [id, comp] of Object.entries(comps)) {
    const w = weights[id] || { traffic: 0.5, throughput: 0.5, users: 0.5 };
    const weighted =
      (sliders.traffic / 100) * w.traffic * 0.4 +
      (sliders.throughput / 100) * w.throughput * 0.3 +
      (sliders.users / 100) * w.users * 0.3;
    loads[id] = Math.round(comp.maxRps * weighted);
  }

  return loads;
}

const SVG_W = 880;
const SVG_H = 580;

export default function App() {
  const [cloud, setCloud] = useState('aws');
  const [selected, setSelected] = useState(null);
  const [sliders, setSliders] = useState({ traffic: 30, throughput: 25, users: 20 });

  const components = CLOUDS[cloud].components;
  const cloudColor = CLOUDS[cloud].color;
  const loads = useMemo(() => computeLoads(cloud, sliders), [cloud, sliders]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>
            <span style={{ color: cloudColor }}>Arch</span>Sim
            <sup style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>TM</sup>
          </h1>
          <span className="subtitle">System Architecture Diagram &amp; Load Simulator</span>
        </div>
        <a
          href="https://github.com/maxilylm/su-archsim"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          GitHub
        </a>
      </header>

      <div className="main">
        <Controls cloud={cloud} setCloud={setCloud} sliders={sliders} setSliders={setSliders} />

        <div className="diagram-container">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="diagram-svg">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={SVG_W} height={SVG_H} fill="url(#grid)" />

            {/* Tier labels */}
            <text x="20" y="50" fill="rgba(255,255,255,0.15)" fontSize="11" fontWeight="600" letterSpacing="3">
              EDGE / INGRESS
            </text>
            <text x="20" y="210" fill="rgba(255,255,255,0.15)" fontSize="11" fontWeight="600" letterSpacing="3">
              COMPUTE
            </text>
            <text x="20" y="370" fill="rgba(255,255,255,0.15)" fontSize="11" fontWeight="600" letterSpacing="3">
              DATA / STORAGE
            </text>

            <line x1="0" y1="150" x2={SVG_W} y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="8,6" />
            <line x1="0" y1="310" x2={SVG_W} y2="310" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="8,6" />

            {CONNECTIONS.map(([from, to], i) => {
              const p1 = LAYOUT[from];
              const p2 = LAYOUT[to];
              if (!p1 || !p2) return null;
              const connLoad = Math.min(loads[from] || 0, loads[to] || 0);
              const connMax = Math.min(
                components[from]?.maxRps || 1,
                components[to]?.maxRps || 1
              );
              return (
                <Connection
                  key={`${from}-${to}`}
                  x1={p1.x} y1={p1.y}
                  x2={p2.x} y2={p2.y}
                  load={connLoad}
                  maxLoad={connMax}
                  cloudColor={cloudColor}
                />
              );
            })}

            {Object.entries(LAYOUT).map(([id, pos]) => {
              if (!components[id]) return null;
              return (
                <ArchNode
                  key={`${cloud}-${id}`}
                  id={id}
                  x={pos.x} y={pos.y}
                  component={components[id]}
                  cloud={cloud}
                  load={loads[id] || 0}
                  cloudColor={cloudColor}
                  onClick={setSelected}
                />
              );
            })}

            <g transform="translate(30, 80)">
              <text fill="rgba(255,255,255,0.25)" fontSize="28">&#x1F464;</text>
              <text x="0" y="42" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">
                {sliders.users > 0 ? `~${Math.round(sliders.users * 100)} users` : 'No users'}
              </text>
            </g>
          </svg>
        </div>

        <Sidebar cloud={cloud} selected={selected} components={components} loads={loads} />
      </div>
    </div>
  );
}
