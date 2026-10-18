import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { JOURNEY, USER_GROUPS, WORKFLOW } from '../data/content.js';

export default function HowItWorks() {
  const [step, setStep] = useState(0);
  const s = JOURNEY[step];
  return (
    <>
      <PageHeader eyebrow="User journey" title="From first report to closed incident" subtitle="Follow one student report through five steps. The urgent alert goes out first; the dashboard tracks status for every role." />
      <div className="container">
        <ol className="swimlane">
          {JOURNEY.map((j, i) => (
            <li key={j.title}>
              <button className={`lane${i === step ? ' on' : ''}${i < step ? ' past' : ''}`} onClick={() => setStep(i)} aria-current={i === step ? 'step' : undefined}>
                <span className="lane-num">{i + 1}</span>
                <span className="lane-role">{j.role}</span>
                <strong>{j.title}</strong>
                <small>{j.short}</small>
              </button>
            </li>
          ))}
        </ol>

        <section className="card step-detail">
          <p className="eyebrow">Step {step + 1} of {JOURNEY.length} · {s.role}</p>
          <h2>{s.title}</h2>
          <p className="lead">{s.detail}</p>
          <div className="row-actions">
            <button className="btn btn-soft" disabled={step === 0} onClick={() => setStep(step - 1)}>← Previous</button>
            <button className="btn btn-soft" disabled={step === JOURNEY.length - 1} onClick={() => setStep(step + 1)}>Next →</button>
            <Link to={s.to} className="btn btn-primary">{s.cta}</Link>
          </div>
        </section>

        <section className="section-tight">
          <div className="section-head"><p className="eyebrow">Six-step workflow</p><h2>Report → Assess → Coordinate → Respond → Resolve → Review</h2></div>
          <ol className="flow">
            {WORKFLOW.map((w, i) => (
              <li key={w.key}><div className="flow-step static"><span className="flow-num">{i + 1}</span><strong>{w.key}</strong><small>{w.desc}</small></div></li>
            ))}
          </ol>
          <div className="notice mt">One shared incident record: everyone sees the same status, and nothing is lost between calls, chats and logs.</div>
        </section>

        <section className="section-tight">
          <div className="section-head"><p className="eyebrow">Who uses it</p><h2>Four user groups, one picture</h2></div>
          <div className="grid-4">
            {USER_GROUPS.map((g) => <div key={g.name} className="card"><h3>{g.name}</h3><p>{g.text}</p></div>)}
          </div>
        </section>
      </div>
    </>
  );
}
