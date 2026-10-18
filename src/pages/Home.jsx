import { Link } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { useIncidents } from '../context/IncidentContext.jsx';
import { FEATURES, INFO_TODAY, USER_GROUPS, WORKFLOW } from '../data/content.js';

export default function Home() {
  const { incidents } = useIncidents();
  const active = incidents.filter((i) => i.status !== 'Resolved');
  const urgent = active.filter((i) => i.urgency === 'Urgent').length;
  const awaiting = active.filter((i) => ['Reported', 'Assessed', 'Assigned'].includes(i.status)).length;

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow light">JAI 2026 · Agentic AI for Open Innovation</p>
            <h1>SafeCampus</h1>
            <p className="hero-sub">Agentic AI for Campus Emergency Coordination</p>
            <p className="hero-text">When seconds matter, everyone should see the same picture. One shared incident record connects the student who reports, the agents that assess, and the humans who respond.</p>
            <div className="hero-actions">
              <Link to="/report" className="btn btn-alert">Report an incident</Link>
              <Link to="/dashboard" className="btn btn-ghost">Open live dashboard</Link>
              <Link to="/prototype" className="btn btn-link">Run the demo scenario →</Link>
            </div>
          </div>
          <div className="hero-logo"><Logo size={150} /></div>
        </div>
      </section>

      <section className="stats container">
        <div className="stat"><b>{active.length}</b><span>Active incidents</span></div>
        <div className="stat"><b className={urgent ? 'text-alert' : ''}>{urgent}</b><span>Urgent now</span></div>
        <div className="stat"><b>{awaiting}</b><span>Awaiting acknowledgement</span></div>
        <div className="stat"><b>{incidents.length - active.length}</b><span>Resolved</span></div>
      </section>

      <section className="section container">
        <div className="section-head">
          <p className="eyebrow">Problem and motivation</p>
          <h2>Campus emergencies run on scattered information</h2>
        </div>
        <div className="grid-2">
          <div className="card scenario">
            <span className="tag">Hypothetical scenario</span>
            <p>Night, library: a student collapses. Friends call security, post in group chats and wonder which number is right. Responders arrive without exact location or context.</p>
            <p className="muted small">An illustrative example, not a real case. No statistics are claimed.</p>
          </div>
          <div className="card">
            <h3>Where the information lives today</h3>
            <ul className="chips">
              {INFO_TODAY.map((t, i) => <li key={t} className={i === INFO_TODAY.length - 1 ? 'chip chip-alert' : 'chip'}>{t}</li>)}
            </ul>
            <h3 className="mt">Who is affected</h3>
            <ul className="chips">
              {USER_GROUPS.map((g) => <li key={g.name} className="chip chip-teal">{g.name}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Proposed solution and innovation</p>
            <h2>Report, assess, coordinate, respond, resolve, review</h2>
            <p className="lead">One shared incident record: everyone sees the same status, and nothing is lost between calls, chats and logs.</p>
          </div>
          <ol className="flow">
            {WORKFLOW.map((s, i) => (
              <li key={s.key}>
                <Link to={s.to} className="flow-step">
                  <span className="flow-num">{i + 1}</span>
                  <strong>{s.key}</strong>
                  <small>{s.desc}</small>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <p className="eyebrow">Key features</p>
          <h2>Everything you need, in one prototype</h2>
        </div>
        <div className="grid-4">
          {FEATURES.map((f) => (
            <Link key={f.title} to={f.to} className="card feature">
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <span className="more">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="card theme">
          <p className="eyebrow">Hackathon theme relevance</p>
          <p><strong>Primary:</strong> Agentic AI for Open Innovation. Agents use tools and manage incident state, beyond chat replies.</p>
          <p><strong>Secondary:</strong> Healthcare, supporting medical-emergency coordination.</p>
        </div>
      </section>
    </>
  );
}
