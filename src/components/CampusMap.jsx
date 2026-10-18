import { LOCATIONS } from '../lib/constants.js';

const URG_COLOR = { Urgent: '#E8512F', High: '#D97706', Medium: '#2563EB', Low: '#64748B', Pending: '#64748B' };

// Schematic sample campus. `mode="pick"` lets the user choose a location; otherwise it shows incident pins.
export default function CampusMap({ incidents = [], selectedId, onSelectIncident, mode = 'view', pickedLocation, onPickLocation }) {
  const active = incidents.filter((i) => i.status !== 'Resolved' && i.locationId);
  return (
    <svg className="campus-map" viewBox="0 0 100 70" role="img" aria-label="Schematic campus map">
      <rect x="0" y="0" width="100" height="70" rx="2" fill="#EAF3F1" />
      <path d="M0 30 H100 M50 0 V70 M12 52 H88" stroke="#fff" strokeWidth="3.2" fill="none" />
      <rect x="62" y="44" width="30" height="20" rx="2" fill="#CFE8DE" />
      {LOCATIONS.map((l) => {
        const picked = pickedLocation === l.id;
        const clickable = mode === 'pick';
        return (
          <g key={l.id} onClick={clickable ? () => onPickLocation?.(l.id) : undefined} style={{ cursor: clickable ? 'pointer' : 'default' }}
             tabIndex={clickable ? 0 : undefined} role={clickable ? 'button' : undefined} aria-label={clickable ? `Choose ${l.name}` : undefined}
             onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onPickLocation?.(l.id); } : undefined}>
            <rect x={l.x - 9} y={l.y - 5} width="18" height="10" rx="1.5" fill={picked ? '#13A89E' : '#fff'} stroke={picked ? '#0E7C74' : '#B9CAD6'} strokeWidth="0.5" />
            <text x={l.x} y={l.y + 1} textAnchor="middle" fontSize="2.3" fill={picked ? '#fff' : '#0B2545'} fontWeight="600">{l.name}</text>
          </g>
        );
      })}
      {mode === 'view' && active.map((inc, idx) => {
        const l = LOCATIONS.find((x) => x.id === inc.locationId);
        if (!l) return null;
        const off = (active.filter((o, j) => j < idx && o.locationId === inc.locationId).length) * 3.6;
        const selected = selectedId === inc.id;
        const color = URG_COLOR[inc.urgency] || URG_COLOR.Pending;
        return (
          <g key={inc.id} onClick={() => onSelectIncident?.(inc.id)} style={{ cursor: 'pointer' }} tabIndex={0} role="button"
             aria-label={`${inc.id} ${inc.category} ${inc.urgency}`} onKeyDown={(e) => { if (e.key === 'Enter') onSelectIncident?.(inc.id); }}>
            {inc.urgency === 'Urgent' && <circle cx={l.x - 6 + off} cy={l.y - 6} r="3.6" fill={color} opacity="0.25" className="pulse" />}
            <circle cx={l.x - 6 + off} cy={l.y - 6} r={selected ? 2.6 : 2} fill={color} stroke="#fff" strokeWidth="0.6" />
          </g>
        );
      })}
    </svg>
  );
}

export const MapLegend = () => (
  <div className="map-legend">
    {['Urgent', 'High', 'Medium', 'Low'].map((u) => (
      <span key={u}><i style={{ background: URG_COLOR[u] }} />{u}</span>
    ))}
  </div>
);
