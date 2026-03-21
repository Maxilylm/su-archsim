import { useState } from 'react';
import SERVICES, { CATEGORIES, getCloudLabel, getCloudDesc } from '../data/catalog';

export default function Palette({ cloud, onAddService }) {
  const [expandedCat, setExpandedCat] = useState(null);
  const [search, setSearch] = useState('');

  const filteredServices = search.trim()
    ? SERVICES.filter(s => {
        const q = search.toLowerCase();
        const label = getCloudLabel(s.id, cloud).toLowerCase();
        const desc = getCloudDesc(s.id, cloud).toLowerCase();
        return label.includes(q) || desc.includes(q) || s.id.includes(q) || s.category.includes(q);
      })
    : null;

  const categoryIds = Object.keys(CATEGORIES);

  return (
    <div className="palette">
      <div className="palette-header">
        <h3>Components</h3>
        <span className="palette-count">{SERVICES.length}</span>
      </div>

      <input
        type="text"
        className="palette-search"
        placeholder="Search services..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Search results */}
      {filteredServices && (
        <div className="palette-results">
          {filteredServices.length === 0 && (
            <p className="palette-empty">No services found</p>
          )}
          {filteredServices.map(s => (
            <button
              key={s.id}
              className="palette-item"
              onClick={() => onAddService(s.id)}
              title={getCloudDesc(s.id, cloud)}
            >
              <span className="palette-item-icon">{CATEGORIES[s.category]?.icon}</span>
              <span className="palette-item-label">{getCloudLabel(s.id, cloud)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Category accordion */}
      {!filteredServices && categoryIds.map(catId => {
        const cat = CATEGORIES[catId];
        const services = SERVICES.filter(s => s.category === catId);
        const isExpanded = expandedCat === catId;

        return (
          <div key={catId} className="palette-category">
            <button
              className="palette-cat-header"
              onClick={() => setExpandedCat(isExpanded ? null : catId)}
              style={{ '--cat-color': cat.color }}
            >
              <span className="palette-cat-icon">{cat.icon}</span>
              <span className="palette-cat-label">{cat.label}</span>
              <span className="palette-cat-count">{services.length}</span>
              <span className={`palette-cat-arrow ${isExpanded ? 'open' : ''}`}>&#9656;</span>
            </button>

            {isExpanded && (
              <div className="palette-cat-items">
                {services.map(s => (
                  <button
                    key={s.id}
                    className="palette-item"
                    onClick={() => onAddService(s.id)}
                    title={getCloudDesc(s.id, cloud)}
                  >
                    <span className="palette-item-dot" style={{ background: cat.color }} />
                    <span className="palette-item-label">{getCloudLabel(s.id, cloud)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
