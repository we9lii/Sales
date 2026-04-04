import { useRole } from '../contexts/RoleContext';
import { AdminDashboard } from './AdminDashboard';
import { EmployeeDashboard } from './EmployeeDashboard';

export function Dashboard() {
  const { role } = useRole();

  return role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />;
}
