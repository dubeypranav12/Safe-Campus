import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CategoryBadge, StatusBadge, UrgencyBadge } from '../components/Badges.jsx';
import Timeline from '../components/Timeline.jsx';
import useNow from '../components/useNow.js';
import { useIncidents } from '../context/IncidentContext.jsx';
import { AGENT_NAMES, CATEGORIES, PERMISSIONS, RESPONDERS, STATUSES, URGENCIES, locationById, responderById } from '../lib/constants.js';
import { findDuplicates } from '../lib/duplicates.js';
import { fmtDateTime, fmtDuration, slaState } from '../lib/format.js';

const NEXT_HINT = {
  Reported: 'The agents are structuring and assessing this report.',
  Assessed: 'Next: a human reviews the suggested responders and approves the assignment.',
  Assigned: 'Next: the responder acknowledges the assignment.',
  Acknowledged: 'Next: the responder handles it, adds notes, then marks it resolved.',
  Resolved: 'Closed. The Reporting Agent compiled the report below.',
};

function Stepper({ status }) {
  const idx = STATUSES.indexOf(status);
  return (
    <ol className="stepper">
      {STATUSES.map((s, i) => (
        <li key={s} className={i < idx ? 'done' : i === idx ? 'current' : ''}>
          <span>{i < idx ? '✓' : i + 1}</span>{s}
        </li>
      ))}
    </ol>
  );
}

function QuestionRow({ inc, question }) {
  const { answerQuestion } = useIncidents();
  const [draft, setDraft] = useState('');
  const answer = inc.answers?.[question];
  if (answer) return <li className="q done"><strong>{question}</strong><span>{answer}</span></li>;
  return (
    <li className="q">
      <strong>{question}</strong>
      <div className="q-input">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Your answer…" aria-label={question}
          onKeyDown={(e) => { if (e.key === 'Enter') { answerQuestion(inc.id, question, draft); setDraft(''); } }} />
        <button className="btn btn-soft" onClick={() => { answerQuestion(inc.id, question, draft); setDraft(''); }}>Send</button>
      </div>
    </li>
  );
}

function AgentRow({ inc, keyName, state }) {
  const a = inc.agents?.[keyName];
  const label = { done: 'Done', running: 'Working…', waiting: 'Waiting' }[state];
  return (
    <li className={`agent agent-${state}`}>
      <div className="row-between"><strong>{AGENT_NAMES[keyName]}</strong><span className={`pill pill-${state}`}>{label}</span></div>
      {keyName === 'intake' && a && <p>“{a.summary}” · {a.location} ({a.locationSource}) · input: {a.modality.join(', ')}</p>}
      {keyName === 'assessment' && a && (
        <>
          <p>Suggested <strong>{a.category}</strong> / <strong>{a.urgency}</strong>. {a.rationale}</p>
          <div className="conf"><span>Confidence {Math.round(a.confidence * 100)}%</span><div className="bar"><i style={{ width: `${a.confidence * 100}%` }} /></div></div>
          {a.source && <p className="muted small">Source: {a.source}{a.modelType ? ` · ${a.modelType}` : ''}</p>}
          {a.recommendedAction && <p className="small"><strong>ML recommendation:</strong> {a.recommendedAction}</p>}
          {a.uncertain && <p className="text-warn small">Low confidence, so a human reviews this.</p>}
        </>
      )}
      {keyName === 'coordination' && a && <p>Recommended: {a.recommended.map((id) => responderById(id)?.name).join(', ')}. Notification drafted; sending needs human approval.</p>}
      {keyName === 'guidance' && a && <p>Retrieved: {a.title}</p>}
      {keyName === 'reporting' && (state === 'done' ? <p>Timestamped report compiled.</p> : <p className="muted">Runs when the incident is resolved.</p>)}
    </li>
  );
}

function ActionPanel({ inc }) {
  const { role, approveAssignment, acknowledge, addNote, resolve, humanReview } = useIncidents();
  const perm = PERMISSIONS[role];
  const coord = inc.agents?.coordination;
  const [chosen, setChosen] = useState('');
  const [note, setNote] = useState('');
  const [resNote, setResNote] = useState('');
  const [cat, setCat] = useState(CATEGORIES.includes(inc.category) ? inc.category : 'Other');
  const [urg, setUrg] = useState(URGENCIES.includes(inc.urgency) ? inc.urgency : 'Medium');
  const effective = chosen || coord?.recommended?.[0] || '';

  return (
    <section className="card">
      <h2>Actions <span className="muted small">as {role}</span></h2>
      <p className="hint">{NEXT_HINT[inc.status]}</p>

      {inc.needsReview && perm.review && (
        <div className="subcard warn-box">
          <h3>Human review needed</h3>
          <p className="small">The Assessment Agent was not confident. Confirm the category and urgency.</p>
          <div className="inputs-row">
            <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            <select value={urg} onChange={(e) => setUrg(e.target.value)} aria-label="Urgency">{URGENCIES.map((c) => <option key={c}>{c}</option>)}</select>
            <button className="btn btn-primary" onClick={() => humanReview(inc.id, { category: cat, urgency: urg })}>Confirm</button>
          </div>
        </div>
      )}

      {inc.status === 'Assessed' && (
        <div className="subcard">
          <h3>Approve assignment</h3>
          {!coord ? <p className="muted">Coordination Agent is still working…</p> : (
            <>
              <label className="small" htmlFor="resp">Responder (recommended first)</label>
              <select id="resp" value={effective} onChange={(e) => setChosen(e.target.value)} disabled={!perm.approve}>
                {[...coord.recommended, ...RESPONDERS.map((r) => r.id).filter((id) => !coord.recommended.includes(id))].map((id) => (
                  <option key={id} value={id}>{responderById(id).name}{coord.recommended.includes(id) ? ' (recommended)' : ''}</option>
                ))}
              </select>
              <p className="draft"><span className="small muted">Drafted notification</span><br />{coord.notification}</p>
              <button className="btn btn-primary" disabled={!perm.approve} onClick={() => approveAssignment(inc.id, effective)}>Approve and send (simulated)</button>
              {!perm.approve && <p className="small muted">Only a responder or administrator can approve. Switch role in the bar above.</p>}
            </>
          )}
        </div>
      )}

      {inc.status === 'Assigned' && (
        <div className="subcard">
          <h3>Acknowledge</h3>
          <p className="small">Assigned to <strong>{responderById(inc.assignedTo)?.name}</strong>.</p>
          <button className="btn btn-primary" disabled={!perm.acknowledge} onClick={() => acknowledge(inc.id)}>Acknowledge assignment</button>
          {!perm.acknowledge && <p className="small muted">Only a Responder can acknowledge. Switch role in the bar above.</p>}
        </div>
      )}

      {['Assigned', 'Acknowledged'].includes(inc.status) && perm.details && (
        <div className="subcard">
          <h3>Add a status note</h3>
          <div className="q-input">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. First-aid team on site" aria-label="Status note"
              onKeyDown={(e) => { if (e.key === 'Enter') { addNote(inc.id, note); setNote(''); } }} />
            <button className="btn btn-soft" onClick={() => { addNote(inc.id, note); setNote(''); }}>Add</button>
          </div>
        </div>
      )}

      {inc.status === 'Acknowledged' && (
        <div className="subcard">
          <h3>Resolve</h3>
          <textarea rows={2} value={resNote} onChange={(e) => setResNote(e.target.value)} placeholder="Resolution note" aria-label="Resolution note" />
          <button className="btn btn-primary" disabled={!perm.resolve} onClick={() => resolve(inc.id, resNote)}>Mark resolved</button>
        </div>
      )}
    </section>
  );
}

function ReportBox({ report, id }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) { /* clipboard blocked */ }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url; a.download = `${id}-report.txt`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="card">
      <div className="row-between"><h2>Incident report</h2>
        <div><button className="btn btn-soft" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button> <button className="btn btn-soft" onClick={download}>Download .txt</button></div>
      </div>
      <pre className="report">{report}</pre>
    </section>
  );
}

export default function IncidentDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { incidents, role } = useIncidents();
  const now = useNow();
  const inc = incidents.find((i) => i.id === id);

  if (!inc) {
    return (
      <div className="container narrow section">
        <div className="card empty"><h1>Incident not found</h1><p>{id} does not exist in this browser's data.</p><Link to="/dashboard" className="btn btn-primary">Back to dashboard</Link></div>
      </div>
    );
  }

  const perm = PERMISSIONS[role];
  const seeDetails = perm.details || inc.mine;
  const sla = slaState(inc, now);
  const dup = findDuplicates(incidents)[inc.id];
  const order = ['intake', 'assessment', 'coordination', 'guidance', 'reporting'];
  const agentState = (k, idx) => {
    if (inc.agentsDone?.[k]) return 'done';
    if (k === 'reporting') return 'waiting';
    const prevDone = order.slice(0, idx).every((p) => inc.agentsDone?.[p]);
    return prevDone ? 'running' : 'waiting';
  };
  const unanswered = (inc.agents?.assessment?.questions || []).filter((q) => !inc.answers?.[q]);

  return (
    <div className="container section-tight">
      <Link to="/dashboard" className="back">← Dashboard</Link>
      <header className="inc-head">
        <div>
          <h1>{inc.id}</h1>
          <p className="muted">{locationById(inc.locationId)?.name || 'Location unknown'} · reported {fmtDateTime(inc.createdAt)}{inc.sample ? ' · sample data' : ''}</p>
        </div>
        <div className="badges">
          {inc.category === 'Pending' ? <span className="badge cat">Assessing…</span> : <CategoryBadge value={inc.category} />}
          {inc.urgency !== 'Pending' && <UrgencyBadge value={inc.urgency} />}
          <StatusBadge value={inc.status} />
          {inc.needsReview && <span className="badge urg-high">Needs review</span>}
          {dup && <span className="badge cat">Possible duplicate of {dup}</span>}
        </div>
      </header>

      {location.state?.justReported && (
        <div className="notice ok">
          <strong>Urgent alert sent first.</strong> The Security Control Desk was alerted immediately (simulated). The agents are now structuring and assessing your report alongside it.
        </div>
      )}

      <Stepper status={inc.status} />
      {sla && (
        <p className={`sla ${sla.overdue ? 'text-alert strong' : 'muted'}`}>
          {sla.overdue ? 'Acknowledgement overdue: ' : 'Awaiting acknowledgement: '}{fmtDuration(sla.elapsed)} since report (target {fmtDuration(sla.limit)}).
        </p>
      )}

      <div className="detail-grid">
        <div className="col">
          <section className="card">
            <h2>Report</h2>
            {seeDetails ? (
              <dl className="kv">
                <dt>Description</dt><dd>{inc.text || (inc.panic ? 'Panic button pressed (no description)' : '—')}</dd>
                <dt>Input</dt><dd>{(inc.modality || []).join(', ')}</dd>
                <dt>Location</dt><dd>{locationById(inc.locationId)?.name || 'Unknown'} <span className="muted">({inc.locationSource})</span></dd>
                {inc.photoName && (<><dt>Photo</dt><dd>{inc.photoName}</dd></>)}
                {perm.details && (<><dt>Reporter</dt><dd>{inc.reporter}</dd></>)}
                {inc.assignedTo && (<><dt>Assigned to</dt><dd>{responderById(inc.assignedTo)?.name}</dd></>)}
              </dl>
            ) : (
              <p className="muted">Details are restricted to responders, administrators and the person who reported it. Students see status only.</p>
            )}
          </section>

          {seeDetails && inc.agents?.assessment && (
            <section className="card">
              <h2>Questions for the reporter</h2>
              {inc.agents.assessment.questions.length === 0 ? <p className="muted">No further questions.</p> : (
                <ul className="qlist">{inc.agents.assessment.questions.map((q) => <QuestionRow key={q} inc={inc} question={q} />)}</ul>
              )}
              {unanswered.length > 0 && <p className="small muted">These run alongside the alert and never delay it.</p>}
            </section>
          )}

          {seeDetails && inc.agents?.guidance && (
            <section className="card guidance">
              <h2>{inc.agents.guidance.title}</h2>
              <ol>{inc.agents.guidance.steps.map((s) => <li key={s}>{s}</li>)}</ol>
              <p className="small muted">{inc.agents.guidance.source}</p>
            </section>
          )}

          {perm.agents && (
            <section className="card">
              <h2>Agent pipeline <span className="tag">simulated</span></h2>
              <ul className="agents">{order.map((k, i) => <AgentRow key={k} inc={inc} keyName={k} state={agentState(k, i)} />)}</ul>
              <p className="small muted">All agents read and write the same incident record. <Link to="/architecture">See the architecture →</Link></p>
            </section>
          )}
        </div>

        <div className="col">
          {perm.details && <ActionPanel key={`${inc.id}-${inc.status}-${inc.needsReview}`} inc={inc} />}
          {!perm.details && (
            <section className="card"><h2>What happens next</h2><p>{NEXT_HINT[inc.status]}</p><p className="small muted">Responders and administrators act on this incident. Switch role in the bar above to see their view.</p></section>
          )}
          {seeDetails && <section className="card"><h2>Timeline</h2><Timeline events={inc.timeline} /></section>}
          {seeDetails && inc.report && <ReportBox report={inc.report} id={inc.id} />}
        </div>
      </div>
    </div>
  );
}
