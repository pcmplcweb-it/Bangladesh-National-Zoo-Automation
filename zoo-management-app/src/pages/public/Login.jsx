import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import { USERS, ROLES } from '../../data/master';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [error, setError] = useState('');
  if (user) return <Navigate to={ROLES[user.role].home} replace />;

  const go = (username, password) => {
    try {
      const me = login(username, password);
      nav(loc.state?.from && loc.state.from !== '/app' ? loc.state.from : ROLES[me.role].home, { replace: true });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="login">
      <div className="login-art">
        <div className="brand" style={{ padding: 0 }}>
          <span className="brand-logo" aria-hidden>🐯</span>
          <span><b>BNZ Management System</b><small className="bn">বাংলাদেশ জাতীয় চিড়িয়াখানা</small></span>
        </div>
        <div>
          <h1>One place to run the zoo, every day.</h1>
          <ul>
            <li>Online and counter ticketing with bKash, Nagad, Rocket and card</li>
            <li>QR entry & exit at the gates — live count of visitors inside</li>
            <li>Sales & visitor reports for any day, week, month or year</li>
            <li>Animal meal schedule with on-time feeding checks</li>
            <li>Staff attendance and leave management</li>
          </ul>
        </div>
        <small style={{ color: '#a9d3b0' }}>Photo: “Mirpur national zoo” by Sojol Rana, CC BY-SA 4.0, via Wikimedia Commons</small>
      </div>
      <div className="login-form">
        <form onSubmit={(e) => { e.preventDefault(); go(u, p); }} className="stack">
          <div>
            <h2 style={{ fontSize: 26, color: 'var(--green-dark)' }}>Staff sign in</h2>
            <p className="muted" style={{ margin: '4px 0 0' }}>Use your staff account.</p>
          </div>
          <label className="field"><span>Username</span><input className="input" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" autoFocus /></label>
          <label className="field"><span>Password</span><input className="input" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" /></label>
          {error && <div className="error" role="alert">{error}</div>}
          <button className="btn btn-lg block">Sign in</button>
          <div>
            <p className="small muted" style={{ margin: '8px 0' }}>Demo accounts — one click to sign in as:</p>
            <div className="role-grid">
              {USERS.map((x) => (
                <button type="button" key={x.username} onClick={() => go(x.username, x.password)}>
                  <b>{ROLES[x.role].label}</b>
                  <span className="muted mono">{x.username} / {x.password}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="small center" style={{ textAlign: 'center' }}><Link to="/book">Go to the public ticket booking page →</Link></p>
        </form>
      </div>
    </div>
  );
}
