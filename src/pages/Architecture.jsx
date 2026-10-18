import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { AGENTS, DETERMINISTIC_HANDLES, LLM_HANDLES, STACK, WHY_MULTI } from '../data/content.js';

export default function Architecture() {
  const [sel, setSel] = useState('intake');
  const agent = AGENTS.find((a) => a.key === sel);
  return (
    <>
      <PageHeader eyebrow="Multi-agent architecture" title="An orchestrator, five agents and humans in charge" subtitle="Click an agent to see what it does and how this prototype simulates it." />
      <div className="container">
        <section className="arch" aria-label="Architecture diagram">
          <div className="arch-inputs">
            {['Text', 'Voice', 'Photo', 'Panic button'].map((t) => <span key={t} className="chip chip-teal">{t}</span>)}
          </div>
          <div className="arch-arrow">↓ reports</div>
          <div className="arch-orch">
            <strong>Orchestrator</strong>
            <span>Manages incident state and hands tasks to specialist agents</span>
          </div>
          <div className="arch-human">Human oversight: responders and admins approve</div>
          <div className="arch-arrow">↓ tasks</div>
          <div className="arch-agents" role="tablist">
            {AGENTS.map((a, i) => (
              <button key={a.key} role="tab" aria-selected={sel === a.key} className={`agent-tile${sel === a.key ? ' on' : ''}`} onClick={() => setSel(a.key)}>
                <span className="lane-num">{i + 1}</span>
                <strong>{a.name}</strong>
                <small>{a.does}</small>
              </button>
            ))}
          </div>
          <div className="arch-arrow">↕ read / write</div>
          <div className="arch-bar db">Shared incident database <small>(single source of truth)</small></div>
          <div className="arch-bar tools">Tool / API layer <small>maps · speech-to-text · notifications · protocol store</small></div>
        </section>

        <section className="card agent-detail">
          <h2>{agent.name} Agent</h2>
          <p><strong>Role:</strong> {agent.does}.</p>
          <p><strong>Tools (proposed):</strong> {agent.tools.join(', ')}.</p>
          <p className="sim"><span className="tag">In this prototype</span> {agent.sim}</p>
        </section>

        <section className="section-tight">
          <div className="section-head"><h2>Why several agents</h2></div>
          <div className="grid-3">
            {WHY_MULTI.map((w) => <div key={w.title} className="card"><h3>{w.title}</h3><p>{w.text}</p></div>)}
          </div>
        </section>

        <section className="section-tight">
          <div className="section-head"><p className="eyebrow">Technology and implementation</p><h2>The LLM interprets. Deterministic code decides.</h2>
            <p className="lead">The LLM interprets messy input. Plain code owns state, permissions, routing and timers.</p></div>
          <div className="grid-2">
            <div className="card"><h3>LLM handles</h3><ul className="ticks">{LLM_HANDLES.map((t) => <li key={t}>{t}</li>)}</ul></div>
            <div className="card"><h3>Deterministic logic handles</h3><ul className="ticks">{DETERMINISTIC_HANDLES.map((t) => <li key={t}>{t}</li>)}</ul></div>
          </div>
        </section>

        <section className="section-tight">
          <div className="section-head"><h2>Proposed stack and this prototype</h2><p className="lead">All stack items are proposed. The prototype stands in for the backend and AI so the flow can be shown end to end.</p></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Layer</th><th>Proposed</th><th>In this prototype</th></tr></thead>
              <tbody>{STACK.map((r) => <tr key={r.layer}><td><strong>{r.layer}</strong></td><td>{r.proposed}</td><td>{r.here}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
