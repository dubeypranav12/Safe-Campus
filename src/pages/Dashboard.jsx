import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { CategoryBadge, StatusBadge, UrgencyBadge } from '../components/Badges.jsx';
import useNow from '../components/useNow.js';
import { useIncidents } from '../context/IncidentContext.jsx';
import { CATEGORIES, PERMISSIONS, STATUSES, URGENCIES, locationById, responderById } from '../lib/constants.js';
import { findDuplicates } from '../lib/duplicates.js';
import { fmtDuration, slaState } from '../lib/format.js';

const URG_RANK = { Urgent: 0, High: 1, Medium: 2, Low: 3, Pending: 1 };

export default function Dashboard() {
  const { incidents, role } = useIncidents();
  const now = useNow();
  const navigate = useNavigate();
  const [view, setView] = useState('list');
  const [fStatus, setFStatus] = useState('All');
  const [fUrgency, setFUrgency] = useState('All');
  const [fCategory, setFCategory] = useState('All');
  const [q, setQ] = useState('');
  const perm = PERMISSIONS[role];
  const dups = findDuplicates(incidents);

  const rows = incidents
    .filter((i) => (fStatus === 'All' || i.status === fStatus)
      && (fUrgency === 'All' || i.urgency === fUrgency)
      && (fCategory === 'All' || i.category === fCategory)
      && (!q || `${i.id} ${locationById(i.locationId)?.name || ''} ${perm.details || i.mine ? i.text : ''}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => {
      const ra = a.status === 'Resolved' ? 9 : URG_RANK[a.urgency] ?? 2;
      const rb = b.status === 'Resolved' ? 9 : URG_RANK[b.urgency] ?? 2;
      return ra - rb || b.createdAt - a.createdAt;
    });

  const active = incidents.filter((i) => i.status !== 'Resolved');
  const overdue = active.filter((i) => slaState(i, now)?.overdue).length;

  const summary = (i) => (perm.details || i.mine ? (i.agents?.intake?.summary || i.text || 'Panic button pressed') : 'Details restricted');
  const timer = (i) => {
    const s = slaState(i, now);
    if (!s) return <span className="muted">{i.status === 'Resolved' ? 'Closed' : 'Acknowledged'}</span>;
    return <span className={s.overdue ? 'text-alert strong' : ''}>{fmtDuration(s.elapsed)}{s.overdue ? ' · ack overdue' : ''}</span>;
  };

  return (
    <>
      <PageHeader eyebrow="Live incident dashboard" title="Incident dashboard" subtitle="One shared incident record. Every role sees the same status; internal details depend on role." />
      <div className="container">
        {!perm.details && (
          <div className="notice">You are viewing as <strong>Student</strong>: status only. Switch to <strong>Responder</strong> or <strong>Administrator</strong> (bar above) to see details and act.</div>
        )}
        <div className="stats-row">
          <div className="stat"><b>{active.length}</b><span>Active</span></div>
          <div className="stat"><b className={active.filter((i) => i.urgency === 'Urgent').length ? 'text-alert' : ''}>{active.filter((i) => i.urgency === 'Urgent').length}</b><span>Urgent</span></div>
          <div className="stat"><b className={overdue ? 'text-alert' : ''}>{overdue}</b><span>Ack overdue</span></div>
          <div className="stat"><b>{incidents.length - active.length}</b><span>Resolved</span></div>
        </div>

        <div className="toolbar">
          <input type="search" placeholder="Search by ID, place or text…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search incidents" />
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} aria-label="Filter by status"><option value="All">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <select value={fUrgency} onChange={(e) => setFUrgency(e.target.value)} aria-label="Filter by urgency"><option value="All">All urgencies</option>{URGENCIES.map((s) => <option key={s}>{s}</option>)}</select>
          <select value={fCategory} onChange={(e) => setFCategory(e.target.value)} aria-label="Filter by category"><option value="All">All categories</option>{CATEGORIES.map((s) => <option key={s}>{s}</option>)}</select>
          <div className="seg" role="group" aria-label="View">
            <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>List</button>
            <button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}>Board</button>
          </div>
          <Link to="/report" className="btn btn-alert">+ New report</Link>
        </div>

        {rows.length === 0 && <div className="card empty">No incidents match these filters.</div>}

        {view === 'list' && rows.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>ID</th><th>Category</th><th>Urgency</th><th>Location</th><th>Status</th><th>Time since report</th><th>Summary</th></tr></thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id} onClick={() => navigate(`/incident/${i.id}`)} className="row-link">
                    <td><Link to={`/incident/${i.id}`} onClick={(e) => e.stopPropagation()}><strong>{i.id}</strong></Link>{i.mine && <span className="tag tiny">yours</span>}</td>
                    <td>{i.category === 'Pending' ? <span className="muted">Assessing…</span> : <CategoryBadge value={i.category} />}</td>
                    <td>{i.urgency === 'Pending' ? <span className="muted">—</span> : <UrgencyBadge value={i.urgency} />}</td>
                    <td>{locationById(i.locationId)?.name || <span className="muted">Unknown</span>}</td>
                    <td><StatusBadge value={i.status} />{i.needsReview && <span className="tag tiny warn">needs review</span>}{dups[i.id] && <span className="tag tiny">possible duplicate of {dups[i.id]}</span>}</td>
                    <td>{timer(i)}</td>
                    <td className="summary-cell">{summary(i)}{perm.details && i.assignedTo ? <small> → {responderById(i.assignedTo)?.name}</small> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'board' && (
          <div className="board">
            {STATUSES.map((s) => (
              <div key={s} className="board-col">
                <h3>{s} <span>{rows.filter((i) => i.status === s).length}</span></h3>
                {rows.filter((i) => i.status === s).map((i) => (
                  <Link key={i.id} to={`/incident/${i.id}`} className="board-card">
                    <div className="row-between"><strong>{i.id}</strong>{i.urgency !== 'Pending' && <UrgencyBadge value={i.urgency} />}</div>
                    <p>{i.category === 'Pending' ? 'Assessing…' : i.category} · {locationById(i.locationId)?.name || 'Unknown location'}</p>
                    <small>{summary(i)}</small>
                    <div className="small mt-s">{timer(i)}</div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
