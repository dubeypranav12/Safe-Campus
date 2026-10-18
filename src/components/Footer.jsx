import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { TEAM } from '../data/content.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Logo size={26} />
          <div>
            <strong>SafeCampus</strong>
            <p>When seconds matter, everyone should see the same picture.</p>
          </div>
        </div>
        <div className="footer-links">
          <Link to="/report">Report</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/architecture">Architecture</Link>
          <Link to="/prototype">Prototype</Link>
          <Link to="/about">Team</Link>
        </div>
        <p className="footer-meta">{TEAM.name} · {TEAM.college}<br />SafeCampus | JAI 2026 | Proposed concept · working prototype with simulated agents</p>
      </div>
    </footer>
  );
}
