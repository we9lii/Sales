/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerProfile } from './pages/CustomerProfile';
import { RoleProvider } from './contexts/RoleContext';

export default function App() {
  return (
    <RoleProvider>
      <Router>
        <div className="flex min-h-screen bg-slate-50 font-sans" dir="rtl">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:id" element={<CustomerProfile />} />
                {/* Fallback for undefined routes */}
                <Route path="*" element={<div className="p-8 text-center text-slate-500">جاري العمل على هذه الصفحة...</div>} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </RoleProvider>
  );
}

