import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RoleBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="rolebar">
      <div className="container rolebar-inner">
        <span className="rolebar-note"><strong>Prototype</strong> · simulated data. In a real emergency, contact campus security or emergency services.</span>
        <div className="session-info">
          <span className="session-role">{user?.role}</span>
          <span className="session-id" title={user?.identifier}>{user?.identifier}</span>
          <button type="button" onClick={signOut}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
