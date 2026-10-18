import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import CampusMap, { MapLegend } from '../components/CampusMap.jsx';
import { CategoryBadge, StatusBadge, UrgencyBadge } from '../components/Badges.jsx';
import { useIncidents } from '../context/IncidentContext.jsx';
import { PERMISSIONS, locationById } from '../lib/constants.js';

export default function MapPage() {
  const { incidents, role } = useIncidents();
  const [selected, setSelected] = useState(null);
  const active = incidents.filter((i) => i.status !== 'Resolved');
  const sel = incidents.find((i) => i.id === selected);
  const perm = PERMISSIONS[role];

  return (
    <>
      <PageHeader eyebrow="Campus map" title="Where incidents are happening" subtitle="Active incidents on a schematic sample campus. Pins pulse for urgent cases. Click a pin or a row for details." />
      <div className="container map-grid">
        <section className="card">
          <CampusMap incidents={incidents} selectedId={selected} onSelectIncident={setSelected} />
          <MapLegend />
          <p className="small muted">Conceptual map with placeholder buildings, not a real campus plan.</p>
        </section>
        <aside className="card">
          <h2>Active incidents ({active.length})</h2>
          {active.length === 0 && <p className="muted">Nothing active right now.</p>}
          <ul className="list-plain">
            {active.map((i) => (
              <li key={i.id}>
                <button className={`list-btn${selected === i.id ? ' on' : ''}`} onClick={() => setSelected(i.id)}>
                  <strong>{i.id}</strong> <span>{locationById(i.locationId)?.name || 'Unknown'}</span>
                  {i.urgency !== 'Pending' && <UrgencyBadge value={i.urgency} />}
                </button>
              </li>
            ))}
          </ul>
          {sel && (
            <div className="subcard">
              <div className="badges">{sel.category !== 'Pending' && <CategoryBadge value={sel.category} />}<StatusBadge value={sel.status} /></div>
              <p>{perm.details || sel.mine ? (sel.agents?.intake?.summary || sel.text || 'Panic button pressed') : 'Details restricted for this role.'}</p>
              <Link to={`/incident/${sel.id}`} className="btn btn-primary">Open {sel.id}</Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
