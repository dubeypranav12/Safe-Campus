import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { ImplBadge } from '../components/Badges.jsx';
import { useIncidents } from '../context/IncidentContext.jsx';
import { DEMO_STEPS } from '../data/content.js';

export default function Prototype() {
  const navigate = useNavigate();
  const { submitReport, resetDemo } = useIncidents();

  function runDemo() {
    const id = submitReport({
      text: 'A student has collapsed in the library and is not responding.',
      locationId: 'library',
      locationSource: 'simulated GPS',
      modality: ['text'],
      panic: false,
    });
    navigate(`/incident/${id}`, { state: { justReported: true } });
  }

  return (
    <>
      <PageHeader eyebrow="Planned prototype demonstration" title="The demo scenario, step by step" subtitle="A student reports a medical incident and the system carries it to a generated report in about 60 to 90 seconds.">
        <div className="hero-actions">
          <button className="btn btn-alert" onClick={runDemo}>Run the demo scenario</button>
          <button className="btn btn-soft" onClick={() => { if (window.confirm('Reset all prototype data to the sample incidents?')) resetDemo(); }}>Reset demo data</button>
        </div>
      </PageHeader>
      <div className="container">
        <div className="legend">
          <strong>Status key</strong>
          <ImplBadge value="Implemented" /> works in this prototype
          <ImplBadge value="Simulated" /> stands in for the real thing
          <ImplBadge value="Planned" /> not built yet
        </div>

        <ol className="demo-steps">
          {DEMO_STEPS.map((d, i) => (
            <li key={d.title} className="card">
              <span className="lane-num">{i + 1}</span>
              <div className="demo-main"><strong>{d.title}</strong><small>{d.where}</small></div>
              <ImplBadge value={d.status} />
              <Link to={d.to} className="more">Open →</Link>
            </li>
          ))}
        </ol>

        <div className="notice">
          <strong>Run the demo scenario</strong> creates a new incident. A Responder can approve the assignment, acknowledge it, add a note and resolve it to generate the report. Sign out and use another prototype role to see role-based access.
        </div>

        <div className="grid-2 section-tight">
          <div className="card">
            <h3>Demo video (under 5 min)</h3>
            <p className="muted">[Add Google Drive link; viewing access enabled for evaluators]</p>
          </div>
          <div className="card">
            <h3>Repository</h3>
            <p className="muted">[Add repository link]</p>
          </div>
        </div>
      </div>
    </>
  );
}
