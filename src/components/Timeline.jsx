import { fmtTime } from '../lib/format.js';

export default function Timeline({ events }) {
  return (
    <ol className="timeline">
      {events.map((e, i) => (
        <li key={i} className={`tl-${e.type}`}>
          <span className="tl-dot" />
          <div>
            <div className="tl-head"><strong>{e.actor}</strong><time>{fmtTime(e.t)}</time></div>
            <p>{e.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
