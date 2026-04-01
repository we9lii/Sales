import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useRole } from '../../contexts/RoleContext';

export function Sidebar() {
  const location = useLocation();
  const { role } = useRole();
  
  const themeColor = 'bg-indigo-600';
  const themeActive = 'text-indigo-400';

  const navItems = [
    { name: 'لوحة القيادة', path: '/', icon: LayoutDashboard },
    { name: 'العملاء والمتابعات', path: '/customers', icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-l border-slate-800">
      <div className="h-16 flex items-center justify-between border-b border-slate-800 px-6">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xl", themeColor)}>
            C
          </div>
          <span className="text-white font-bold text-lg tracking-wide">
            نظام العمولات والمتابعة
          </span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group",
                isActive 
                  ? `text-white bg-indigo-500/10` 
                  : `hover:text-white hover:bg-slate-800`
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className={cn("absolute right-0 top-0 bottom-0 w-1 rounded-l-full", themeColor)}
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn("w-5 h-5", isActive ? themeActive : "text-slate-400 group-hover:text-slate-300")} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors w-full">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
