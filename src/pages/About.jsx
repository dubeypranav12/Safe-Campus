import PageHeader from '../components/PageHeader.jsx';
import { FUTURE, MVP, TEAM } from '../data/content.js';

export default function About() {
  return (
    <>
      <PageHeader eyebrow="Future scope and closing" title={TEAM.name} subtitle={TEAM.college} />
      <div className="container">
        <div className="grid-2">
          <section className="card">
            <h2>Team members</h2>
            <ul className="members">{TEAM.members.map((m) => <li key={m}>{m}</li>)}</ul>
            <p className="mt"><strong>Contact:</strong> <a href={`mailto:${TEAM.email}`}>{TEAM.email}</a></p>
          </section>
          <section className="card">
            <h2>Event</h2>
            <p>JAI 2026 · SafeCampus: Agentic AI for Campus Emergency Coordination.</p>
            <p><strong>Theme:</strong> Primary, Agentic AI for Open Innovation. Secondary, Healthcare.</p>
          </section>
        </div>

        <section className="section-tight">
          <div className="section-head"><h2>What we can build now, and what comes next</h2></div>
          <div className="grid-2">
            <div className="card"><span className="tag">Hackathon MVP</span><ul className="ticks">{MVP.map((t) => <li key={t}>{t}</li>)}</ul></div>
            <div className="card"><span className="tag">Future scope</span><ul className="ticks future">{FUTURE.map((t) => <li key={t}>{t}</li>)}</ul>
              <p className="small muted">None of these integrations exist yet.</p></div>
          </div>
        </section>

        <p className="closing">When seconds matter, everyone should see the same picture.</p>
      </div>
    </>
  );
}
