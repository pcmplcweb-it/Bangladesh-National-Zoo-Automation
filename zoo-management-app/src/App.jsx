import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/auth';
import { ToastProvider } from './components/ui';
import Layout from './components/Layout';
import BookTickets from './pages/public/BookTickets';
import TicketPage from './pages/public/TicketPage';
import Login from './pages/public/Login';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));
const CounterSale = lazy(() => import('./pages/ticketing/CounterSale'));
const TicketList = lazy(() => import('./pages/ticketing/TicketList'));
const Gate = lazy(() => import('./pages/gate/Gate'));
const FeedingToday = lazy(() => import('./pages/feeding/FeedingToday'));
const FeedingSchedule = lazy(() => import('./pages/feeding/FeedingSchedule'));
const Employees = lazy(() => import('./pages/hr/Employees'));
const Attendance = lazy(() => import('./pages/hr/Attendance'));
const Leave = lazy(() => import('./pages/hr/Leave'));
import { ROLES } from './data/master';

function Guard({ mod, children }) {
  const { user, can } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!can(mod)) return <Navigate to={ROLES[user.role].home} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/book" element={<BookTickets />} />
          <Route path="/ticket" element={<TicketPage />} />
          <Route path="/ticket/:id" element={<TicketPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<Layout />}>
            <Route index element={<Guard mod="dashboard"><Dashboard /></Guard>} />
            <Route path="reports" element={<Guard mod="reports"><Reports /></Guard>} />
            <Route path="counter" element={<Guard mod="counter"><CounterSale /></Guard>} />
            <Route path="tickets" element={<Guard mod="tickets"><TicketList /></Guard>} />
            <Route path="gate" element={<Guard mod="gate"><Gate /></Guard>} />
            <Route path="feeding" element={<Guard mod="feeding"><FeedingToday /></Guard>} />
            <Route path="feeding/schedule" element={<Guard mod="feedingSchedule"><FeedingSchedule /></Guard>} />
            <Route path="employees" element={<Guard mod="employees"><Employees /></Guard>} />
            <Route path="attendance" element={<Guard mod="attendance"><Attendance /></Guard>} />
            <Route path="leave" element={<Guard mod="leave"><Leave /></Guard>} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
