import { Bell, Search, UserCircle, Shield, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useRole } from '../../contexts/RoleContext';

export function Header() {
  const location = useLocation();
  const { role, setRole } = useRole();
  const themeColor = role === 'admin' ? 'text-indigo-600 bg-indigo-100' : 'text-emerald-600 bg-emerald-100';
  const ringColor = role === 'admin' ? 'focus:ring-indigo-500/50 focus:border-indigo-500' : 'focus:ring-emerald-500/50 focus:border-emerald-500';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="ابحث عن عميل، رقم هاتف، أو تذكرة..." 
            className={cn("w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm", ringColor)}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Role Toggle for Demo Purposes */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setRole('admin')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              role === 'admin' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Shield className="w-4 h-4" />
            مشرف
          </button>
          <button
            onClick={() => setRole('employee')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              role === 'employee' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <User className="w-4 h-4" />
            موظف
          </button>
        </div>

        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="flex items-center gap-3 border-r border-slate-200 pr-6">
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">{role === 'admin' ? 'أحمد الإداري' : 'سارة محمد'}</p>
            <p className="text-xs text-slate-500">{role === 'admin' ? 'مشرف النظام' : 'موظف مبيعات'}</p>
          </div>
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", themeColor)}>
            <UserCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
