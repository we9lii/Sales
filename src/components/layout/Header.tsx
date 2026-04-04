import { Bell, Search, UserCircle, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { mockNotifications } from '../../data/mockData';
import { format } from 'date-fns';

export function Header() {
  const location = useLocation();
  const { role, user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const themeColor = role === 'admin' ? 'text-indigo-600 bg-indigo-100' : 'text-emerald-600 bg-emerald-100';
  const ringColor = role === 'admin' ? 'focus:ring-indigo-500/50 focus:border-indigo-500' : 'focus:ring-emerald-500/50 focus:border-emerald-500';

  return (
    <header className="h-16 glass-header flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="ابحث عن عميل، رقم هاتف، أو تذكرة..." 
            className={cn("w-full pl-4 pr-10 py-2 glass-input rounded-xl focus:outline-none transition-all text-sm dark:text-white dark:placeholder-slate-400", ringColor)}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              // Mark as read when opened
              if (!showNotifications) {
                mockNotifications.filter(n => n.userId === (role === 'admin' ? 'U-1' : 'U-2')).forEach(n => n.read = true);
              }
            }}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            {mockNotifications.filter(n => n.userId === (role === 'admin' ? 'U-1' : 'U-2') && !n.read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute left-0 top-full mt-3 w-80 glass-modal shadow-2xl rounded-2xl overflow-hidden z-50 transform origin-top border border-white/60 dark:border-white/10">
              <div className="p-4 border-b border-white/40 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 flex justify-between items-center backdrop-blur-md">
                <h3 className="font-bold text-slate-900 dark:text-white">الإشعارات</h3>
                {mockNotifications.filter(n => n.userId === (role === 'admin' ? 'U-1' : 'U-2') && !n.read).length > 0 && (
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">جديد</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.filter(n => n.userId === (role === 'admin' ? 'U-1' : 'U-2')).length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {mockNotifications.filter(n => n.userId === (role === 'admin' ? 'U-1' : 'U-2')).map(notif => (
                      <div key={notif.id} className={cn("p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors", !notif.read && "bg-indigo-50/50 dark:bg-indigo-900/20")}>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{notif.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 font-mono" dir="ltr">{format(new Date(notif.createdAt), 'MM/dd HH:mm')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm">لا توجد إشعارات حالياً</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-r border-white/50 dark:border-white/10 pr-6">
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'مستخدم'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{role === 'admin' ? 'مشرف النظام' : 'موظف'}</p>
          </div>
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", themeColor, "shadow-sm border border-white/60 dark:border-white/10")}>
            <UserCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
