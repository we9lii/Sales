/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerProfile } from './pages/CustomerProfile';
import { Performance } from './pages/Performance';
import { Tasks } from './pages/Tasks';
import { Evaluations } from './pages/Evaluations';
import { NotFound } from './pages/NotFound';
import { Login } from './pages/Login';
import { Guide } from './pages/Guide';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';


function MainLayout() {
  return (
    <div className="flex min-h-screen font-sans" dir="rtl">
      <div className="app-bg"></div>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerProfile />} />
              <Route path="performance" element={<Performance />} />
              <Route path="evaluations" element={<Evaluations />} />
              <Route path="tasks" element={<Tasks />} />
              {/* Fallback for undefined routes */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}
