import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const ACCOUNT_TYPES = [
  {
    role: 'Student',
    icon: 'ST',
    title: 'Student',
    description: 'Report incidents and follow the status of your reports.',
    label: 'Student ID or email',
    placeholder: 'e.g. 2201234 or student@campus.edu',
  },
  {
    role: 'Responder',
    icon: 'RS',
    title: 'Responder',
    description: 'Review assignments, acknowledge incidents and add updates.',
    label: 'Responder ID or email',
    placeholder: 'e.g. RESP-104 or responder@campus.edu',
  },
  {
    role: 'Administrator',
    icon: 'AD',
    title: 'Administrator',
    description: 'Review incidents, approve routing and monitor operations.',
    label: 'Administrator ID or email',
    placeholder: 'e.g. admin@campus.edu',
  },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const suggestedRole = ACCOUNT_TYPES.some((item) => item.role === location.state?.suggestedRole)
    ? location.state.suggestedRole
    : 'Student';
  const [role, setRole] = useState(suggestedRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const account = useMemo(() => ACCOUNT_TYPES.find((item) => item.role === role), [role]);

  if (user) return <Navigate to="/" replace />;

  const returnLocation = location.state?.from;
  const destination = returnLocation
    ? `${returnLocation.pathname}${returnLocation.search || ''}${returnLocation.hash || ''}`
    : '/';

  function submit(event) {
    event.preventDefault();
    setError('');
    try {
      login({ role, identifier, password });
      navigate(destination, { replace: true, state: returnLocation?.state });
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  return (
    <main className="login-page">
      <section className="login-intro">
        <div className="login-intro-inner">
          <div className="login-brand"><Logo size={54} /><span>SafeCampus</span></div>
          <p className="eyebrow light">Campus emergency coordination</p>
          <h1>The right information.<br />The right people.<br />Right away.</h1>
          <p>One secure entry point for students, responders and campus administrators.</p>
          <ul className="login-points">
            <li>Role-based access to incident details</li>
            <li>ML-assisted category and urgency assessment</li>
            <li>Human approval for safety-critical actions</li>
          </ul>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-card">
          <div className="login-heading">
            <p className="eyebrow">Authorized access</p>
            <h2 id="login-title">Sign in to SafeCampus</h2>
            <p className="muted">Choose your campus role to continue.</p>
          </div>

          <div className="account-types" role="tablist" aria-label="Account type">
            {ACCOUNT_TYPES.map((item) => (
              <button
                key={item.role}
                type="button"
                role="tab"
                aria-selected={role === item.role}
                className={`account-type${role === item.role ? ' selected' : ''}`}
                onClick={() => { setRole(item.role); setError(''); }}
              >
                <span className="account-icon" aria-hidden="true">{item.icon}</span>
                <span><strong>{item.title}</strong><small>{item.description}</small></span>
              </button>
            ))}
          </div>

          <form className="login-form" onSubmit={submit}>
            <label htmlFor="login-id">{account.label}</label>
            <input
              id="login-id"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={account.placeholder}
              autoFocus
              required
            />

            <label htmlFor="login-password">Password</label>
            <div className="password-field">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="btn btn-primary login-submit" type="submit">Sign in as {role}</button>
          </form>

          <div className="demo-auth-note">
            <strong>Prototype sign-in</strong>
            <p>Authentication is currently demonstrated in the browser. Use any campus ID and a password of at least four characters. Do not enter a real password.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
