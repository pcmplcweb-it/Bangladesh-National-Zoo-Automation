// Demo authentication (frontend only). Replace with the backend's login / JWT session.
import { createContext, useContext, useState } from 'react';
import { USERS, ACCESS } from '../data/master';

const KEY = 'bnz-user';
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch {
      return null;
    }
  });
  const login = (username, password) => {
    const u = USERS.find((x) => x.username === username.trim().toLowerCase() && x.password === password);
    if (!u) throw new Error('Wrong username or password.');
    const { password: _pw, ...safe } = u;
    setUser(safe);
    try { localStorage.setItem(KEY, JSON.stringify(safe)); } catch { /* ignore */ }
    return safe;
  };
  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  };
  const can = (module) => !!user && (ACCESS[module] || []).includes(user.role);
  return <AuthCtx.Provider value={{ user, login, logout, can }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
