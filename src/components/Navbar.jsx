import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo.jsx';

const LINKS = [
  ['/report', 'Report'],
  ['/dashboard', 'Dashboard'],
  ['/map', 'Campus map'],
  ['/how-it-works', 'How it works'],
  ['/architecture', 'Architecture'],
  ['/prototype', 'Prototype'],
  ['/impact', 'Impact'],
  ['/about', 'Team'],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <Logo size={30} />
          <span>SafeCampus</span>
        </Link>
        <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? '✕' : '☰'}
        </button>
        <nav className={`nav-links${open ? ' open' : ''}`}>
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
