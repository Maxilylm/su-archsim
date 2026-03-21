import { memo, useMemo } from 'react';
import { lintArchitecture } from '../data/linting';

const SEVERITY_ICONS = { error: '🔴', warning: '🟡', info: '🔵' };

const LintPanel = memo(function LintPanel({ nodes, edges, onSelectNode }) {
  const warnings = useMemo(() => lintArchitecture(nodes, edges), [nodes, edges]);

  if (warnings.length === 0) return null;

  return (
    <div className="lint-panel">
      <div className="lint-header">
        <span className="lint-title">Architecture Lint</span>
        <span className="lint-count">{warnings.length}</span>
      </div>
      <div className="lint-list">
        {warnings.map((w, i) => (
          <div
            key={i}
            className={`lint-item lint-${w.severity}`}
            onClick={() => w.nodeIds[0] && onSelectNode(w.nodeIds[0])}
            style={{ cursor: w.nodeIds[0] ? 'pointer' : 'default' }}
          >
            <span className="lint-icon">{SEVERITY_ICONS[w.severity]}</span>
            <span className="lint-msg">{w.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default LintPanel;
