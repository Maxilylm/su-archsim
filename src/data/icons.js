// SVG icon paths for each component type
// These are simple recognizable shapes for each service category

const ICONS = {
  dns: (color) => `
    <circle cx="20" cy="20" r="16" fill="none" stroke="${color}" stroke-width="2"/>
    <text x="20" y="24" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold" font-family="monospace">DNS</text>
  `,
  cdn: (color) => `
    <circle cx="20" cy="20" r="16" fill="none" stroke="${color}" stroke-width="2"/>
    <circle cx="20" cy="20" r="10" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="3,2"/>
    <circle cx="20" cy="20" r="4" fill="${color}"/>
  `,
  lb: (color) => `
    <rect x="4" y="8" width="32" height="24" rx="4" fill="none" stroke="${color}" stroke-width="2"/>
    <line x1="20" y1="12" x2="20" y2="28" stroke="${color}" stroke-width="2"/>
    <polyline points="14,18 20,12 26,18" fill="none" stroke="${color}" stroke-width="2"/>
    <polyline points="14,22 20,28 26,22" fill="none" stroke="${color}" stroke-width="2"/>
  `,
  gateway: (color) => `
    <rect x="4" y="6" width="32" height="28" rx="3" fill="none" stroke="${color}" stroke-width="2"/>
    <line x1="4" y1="16" x2="36" y2="16" stroke="${color}" stroke-width="1.5"/>
    <line x1="4" y1="24" x2="36" y2="24" stroke="${color}" stroke-width="1.5"/>
    <circle cx="12" cy="11" r="2" fill="${color}"/>
    <circle cx="12" cy="20" r="2" fill="${color}"/>
    <circle cx="12" cy="28" r="2" fill="${color}"/>
  `,
  compute: (color) => `
    <rect x="4" y="4" width="32" height="32" rx="3" fill="none" stroke="${color}" stroke-width="2"/>
    <rect x="10" y="10" width="20" height="20" rx="2" fill="none" stroke="${color}" stroke-width="1.5"/>
    <line x1="20" y1="4" x2="20" y2="10" stroke="${color}" stroke-width="1.5"/>
    <line x1="20" y1="30" x2="20" y2="36" stroke="${color}" stroke-width="1.5"/>
    <line x1="4" y1="20" x2="10" y2="20" stroke="${color}" stroke-width="1.5"/>
    <line x1="30" y1="20" x2="36" y2="20" stroke="${color}" stroke-width="1.5"/>
  `,
  emr: (color) => `
    <circle cx="20" cy="14" r="6" fill="none" stroke="${color}" stroke-width="2"/>
    <circle cx="12" cy="28" r="6" fill="none" stroke="${color}" stroke-width="2"/>
    <circle cx="28" cy="28" r="6" fill="none" stroke="${color}" stroke-width="2"/>
    <line x1="16" y1="18" x2="14" y2="22" stroke="${color}" stroke-width="1.5"/>
    <line x1="24" y1="18" x2="26" y2="22" stroke="${color}" stroke-width="1.5"/>
    <line x1="18" y1="28" x2="22" y2="28" stroke="${color}" stroke-width="1.5"/>
  `,
  cache: (color) => `
    <ellipse cx="20" cy="12" rx="14" ry="6" fill="none" stroke="${color}" stroke-width="2"/>
    <line x1="6" y1="12" x2="6" y2="28" stroke="${color}" stroke-width="2"/>
    <line x1="34" y1="12" x2="34" y2="28" stroke="${color}" stroke-width="2"/>
    <ellipse cx="20" cy="28" rx="14" ry="6" fill="none" stroke="${color}" stroke-width="2"/>
    <text x="20" y="23" text-anchor="middle" fill="${color}" font-size="7" font-weight="bold" font-family="monospace">⚡</text>
  `,
  db: (color) => `
    <ellipse cx="20" cy="10" rx="14" ry="6" fill="none" stroke="${color}" stroke-width="2"/>
    <line x1="6" y1="10" x2="6" y2="30" stroke="${color}" stroke-width="2"/>
    <line x1="34" y1="10" x2="34" y2="30" stroke="${color}" stroke-width="2"/>
    <ellipse cx="20" cy="30" rx="14" ry="6" fill="none" stroke="${color}" stroke-width="2"/>
    <ellipse cx="20" cy="20" rx="14" ry="6" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="3,3"/>
  `,
  queue: (color) => `
    <rect x="2" y="10" width="10" height="20" rx="2" fill="none" stroke="${color}" stroke-width="2"/>
    <rect x="15" y="10" width="10" height="20" rx="2" fill="none" stroke="${color}" stroke-width="2"/>
    <rect x="28" y="10" width="10" height="20" rx="2" fill="none" stroke="${color}" stroke-width="2"/>
    <polyline points="12,20 15,20" fill="none" stroke="${color}" stroke-width="2"/>
    <polyline points="25,20 28,20" fill="none" stroke="${color}" stroke-width="2"/>
  `,
  storage: (color) => `
    <path d="M6,30 L6,14 L20,4 L34,14 L34,30 Z" fill="none" stroke="${color}" stroke-width="2"/>
    <line x1="6" y1="14" x2="34" y2="14" stroke="${color}" stroke-width="1.5"/>
    <line x1="20" y1="4" x2="20" y2="14" stroke="${color}" stroke-width="1.5"/>
  `,
  stream: (color) => `
    <path d="M4,14 Q12,4 20,14 Q28,24 36,14" fill="none" stroke="${color}" stroke-width="2.5"/>
    <path d="M4,24 Q12,14 20,24 Q28,34 36,24" fill="none" stroke="${color}" stroke-width="2.5"/>
  `,
  functions: (color) => `
    <text x="20" y="26" text-anchor="middle" fill="${color}" font-size="22" font-weight="bold" font-family="monospace">λ</text>
    <rect x="4" y="4" width="32" height="32" rx="6" fill="none" stroke="${color}" stroke-width="2"/>
  `,
};

export default ICONS;
