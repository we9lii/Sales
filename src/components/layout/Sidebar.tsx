import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, TrendingUp, CheckSquare, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { role, logout } = useAuth();
  
  const themeColor = 'bg-indigo-600';
  const themeActive = 'text-indigo-400';

  const navItems = [
    { name: 'لوحة القيادة', path: '/', icon: LayoutDashboard },
    { name: 'العملاء والمتابعات', path: '/customers', icon: Users },
    { name: 'الأداء', path: '/performance', icon: TrendingUp },
    { name: 'المهام', path: '/tasks', icon: CheckSquare },
  ];

  if (role === 'admin') {
    navItems.splice(2, 0, { name: 'الاعتمادات وتقييم الأداء', path: '/evaluations', icon: ShieldCheck });
  }

  return (
    <aside className={cn("glass-nav text-slate-800 dark:text-slate-200 flex flex-col h-screen sticky top-0 transition-all duration-300 z-40", isCollapsed ? "w-20 items-center" : "w-64")}>
      <div className={cn("h-16 flex items-center border-b border-white/40 dark:border-white/10 relative w-full", isCollapsed ? "justify-center px-0" : "justify-between px-6")}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 transition-all shadow-sm z-50"
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      <nav className={cn("flex-1 py-6 space-y-2 overflow-y-auto w-full custom-scrollbar", isCollapsed ? "px-2" : "px-4")}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative group",
                isActive 
                  ? `text-indigo-900 dark:text-indigo-100 bg-white/60 dark:bg-slate-800/60 shadow-sm border border-white/80 dark:border-white/10` 
                  : `hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-white/40 dark:hover:bg-slate-800/40`
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
              <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500")} />
              {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t border-white/40 dark:border-white/10 bg-white/20 dark:bg-slate-900/20 w-full", isCollapsed ? "p-3" : "p-4")}>
        <button 
          onClick={() => logout()}
          className={cn("flex items-center gap-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors w-full", isCollapsed ? "justify-center px-0 py-3" : "px-3 py-2.5")}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}
