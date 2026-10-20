import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useIncidents } from './IncidentContext.jsx';
import { ROLES } from '../lib/constants.js';

const AUTH_STORAGE_KEY = 'safecampus.auth.v1';
const AuthContext = createContext(null);

function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    if (saved && ROLES.includes(saved.role) && saved.identifier) return saved;
  } catch (error) { /* ignore invalid or blocked storage */ }
  return null;
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession);
  const { setRole } = useIncidents();

  useEffect(() => {
    if (user) setRole(user.role);
  }, [setRole, user]);

  const login = useCallback(({ role, identifier, password }) => {
    const cleanIdentifier = identifier.trim();
    if (!ROLES.includes(role)) throw new Error('Choose a valid account type.');
    if (cleanIdentifier.length < 3) throw new Error('Enter your campus ID or email.');
    if (password.length < 4) throw new Error('Password must be at least four characters.');

    const session = {
      role,
      identifier: cleanIdentifier,
      signedInAt: Date.now(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    setRole(role);
    setUser(session);
    return session;
  }, [setRole]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
