import { memo } from 'react';

const SHORTCUTS = [
  { keys: ['Delete', 'Backspace'], desc: 'Delete selected node or edge' },
  { keys: ['Escape'], desc: 'Deselect / close panels' },
  { keys: ['Ctrl', 'Z'], desc: 'Undo last action' },
  { keys: ['Ctrl', 'Shift', 'Z'], desc: 'Redo last undone action' },
  { keys: ['Ctrl', 'D'], desc: 'Duplicate selected node' },
  { keys: ['G'], desc: 'Toggle snap-to-grid' },
  { keys: ['F'], desc: 'Toggle failure mode on selected node' },
  { keys: ['?'], desc: 'Toggle this shortcut reference' },
  { keys: ['Scroll'], desc: 'Zoom in / out' },
  { keys: ['Click + Drag'], desc: 'Pan canvas' },
  { keys: ['Pinch'], desc: 'Zoom (touch)' },
];

const KeyboardShortcuts = memo(function KeyboardShortcuts({ onClose }) {
  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h3>Keyboard Shortcuts</h3>
          <button className="shortcuts-close" onClick={onClose}>&times;</button>
        </div>
        <div className="shortcuts-list">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="shortcut-row">
              <div className="shortcut-keys">
                {s.keys.map((k, j) => (
                  <span key={j}>
                    {j > 0 && <span className="shortcut-plus">+</span>}
                    <kbd className="shortcut-kbd">{k}</kbd>
                  </span>
                ))}
              </div>
              <span className="shortcut-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default KeyboardShortcuts;
