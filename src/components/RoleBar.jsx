import { ROLES } from '../lib/constants.js';
import { useIncidents } from '../context/IncidentContext.jsx';

export default function RoleBar() {
  const { role, setRole } = useIncidents();
  return (
    <div className="rolebar">
      <div className="container rolebar-inner">
        <span className="rolebar-note"><strong>Prototype</strong> · simulated data. In a real emergency, contact campus security or emergency services.</span>
        <div className="rolebar-switch" role="group" aria-label="View as role">
          <span>View as</span>
          {ROLES.map((r) => (
            <button key={r} className={role === r ? 'on' : ''} onClick={() => setRole(r)} aria-pressed={role === r}>{r}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
