import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { useIncidents } from '../context/IncidentContext.jsx';
import { BENEFITS, SAFEGUARDS } from '../data/content.js';
import { STATUSES } from '../lib/constants.js';
import { findDuplicates } from '../lib/duplicates.js';
import { eventTime, fmtDuration } from '../lib/format.js';

export default function Impact() {
  const { incidents } = useIncidents();
  const acked = incidents.filter((i) => eventTime(i, 'acknowledged'));
  const avgAck = acked.length ? acked.reduce((n, i) => n + (eventTime(i, 'acknowledged') - i.createdAt), 0) / acked.length : null;

  const assigned = incidents.filter((i) => i.assignedTo && i.agents?.coordination);
  const matched = assigned.filter((i) => i.agents.coordination.recommended.includes(i.assignedTo)).length;

  const dupCount = Object.keys(findDuplicates(incidents)).length;

  const complete = incidents.filter((i) => {
    const idx = STATUSES.indexOf(i.status);
    return i.category !== 'Pending' && i.locationId && i.timeline.length >= 4 && (idx < 2 || i.assignedTo) && (i.status !== 'Resolved' || i.report);
  }).length;

  const metrics = [
    { name: 'Report-to-acknowledgement time', value: avgAck == null ? '—' : fmtDuration(avgAck), note: `Average over ${acked.length} acknowledged incident(s).` },
    { name: 'Assignment accuracy', value: assigned.length ? `${Math.round((matched / assigned.length) * 100)}%` : '—', note: `${matched} of ${assigned.length} approved assignments matched the agent's recommendation.` },
    { name: 'Duplicate-report handling', value: String(dupCount), note: 'Possible duplicates flagged (same place and category within 15 minutes).' },
    { name: 'Incident-log completeness', value: incidents.length ? `${Math.round((complete / incidents.length) * 100)}%` : '—', note: `${complete} of ${incidents.length} incidents have every required field.` },
  ];

  return (
    <>
      <PageHeader eyebrow="Impact, feasibility and responsible operation" title="What it could improve, and how we would know" subtitle="Benefits are potential, not proven. The numbers below are computed live from this prototype's sample data to show how success would be measured." />
      <div className="container">
        <section className="section-tight">
          <div className="section-head"><h2>Potential benefits</h2></div>
          <div className="grid-3">{BENEFITS.map((b) => <div key={b.title} className="card"><h3>{b.title}</h3><p>{b.text}</p></div>)}</div>
        </section>

        <section className="section-tight">
          <div className="section-head"><h2>How we would measure it</h2><p className="lead">Computed from the incidents currently in this prototype. Illustrative only: this is not evidence of real-world impact.</p></div>
          <div className="grid-4">
            {metrics.map((m) => (
              <div key={m.name} className="card metric"><span className="muted small">{m.name}</span><b>{m.value}</b><small>{m.note}</small></div>
            ))}
          </div>
        </section>

        <section className="section-tight">
          <div className="section-head"><h2>Safeguards</h2><p className="lead">Each safeguard is built into the prototype flow where it can be shown.</p></div>
          <ul className="safeguards">
            {SAFEGUARDS.map((s) => (
              <li key={s.title} className="card"><h3>{s.title}</h3><p>{s.text}</p><p className="small"><span className="tag">In the prototype</span> {s.where}</p></li>
            ))}
          </ul>
          <p className="mt"><Link to="/report" className="btn btn-soft">Try a vague report to see escalation</Link></p>
        </section>
      </div>
    </>
  );
}
