import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MapPin, Phone, User, Clock, MessageSquare, ArrowLeftRight, Users as UsersIcon, LayoutGrid, List, BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';
import { Ticket } from '../data/mockData';
import { useData } from '../contexts/DataContext';
import { Link, useSearchParams } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { AddCustomerModal } from '../components/customers/AddCustomerModal';
import { useRole } from '../contexts/RoleContext';

export function Customers() {
  const { role } = useRole();
  const { tickets: mockTickets } = useData();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'الكل' | 'جديد' | 'جاري المتابعة' | 'محول' | 'مغلق'>('الكل');
  const [refreshKey, setRefreshKey] = useState(0); // For forcing a re-render locally
  
  // Admin specific states
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [employeeFilter, setEmployeeFilter] = useState<string>('الكل');

  useEffect(() => {
    if (initialStatus === 'closed') {
      setStatusFilter('مغلق');
    }
  }, [initialStatus]);

  // Current user (mock for employee view)
  const currentUserId = 'U-2'; // سارة محمد

  // Base tickets depends on role
  const baseTickets = role === 'admin' 
    ? mockTickets 
    : mockTickets.filter(t => t.createdBy === currentUserId || t.currentOwnerId === currentUserId);

  // Extract unique employees for the filter dropdown
  const uniqueEmployees = Array.from(new Set(mockTickets.map(t => t.currentOwnerName)));

  // Filter tickets
  const filteredTickets = baseTickets.filter(t => {
    const matchesSearch = t.clientName.includes(searchTerm) || t.mobileNumber.includes(searchTerm) || t.location.includes(searchTerm);
    const matchesStatus = statusFilter === 'الكل' || t.status === statusFilter;
    const matchesEmployee = role === 'admin' ? (employeeFilter === 'الكل' || t.currentOwnerName === employeeFilter) : true;
    return matchesSearch && matchesStatus && matchesEmployee;
  });

  const openTicketsCount = baseTickets.filter(t => t.status !== 'مغلق').length;
  const closedTicketsCount = baseTickets.filter(t => t.status === 'مغلق').length;

  // Calculate some simple stats for Admin header
  const topEmployee = uniqueEmployees.reduce((best, curr) => {
    const currCount = mockTickets.filter(t => t.currentOwnerName === curr && t.status !== 'مغلق').length;
    const bestCount = mockTickets.filter(t => t.currentOwnerName === best && t.status !== 'مغلق').length;
    return currCount > bestCount ? curr : best;
  }, uniqueEmployees[0]);

  const recentTransfers = mockTickets.filter(t => t.transfers && t.transfers.length > 0).length;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-l from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">العملاء والمتابعات</h1>
            {role === 'admin' && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                وضع الإشراف
              </span>
            )}
          </div>
          <p className="text-slate-500 mt-2 font-medium">إدارة بيانات العملاء، التحويلات، ومتابعة الحالات لجميع الموظفين.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex glass-panel border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="px-5 py-2 border-l border-white/50 text-center">
              <span className="block text-xs text-slate-500 font-medium">إجمالي</span>
              <span className="block text-xl font-bold text-slate-900">{baseTickets.length}</span>
            </div>
            <div className="px-5 py-2 border-l border-white/50 text-center bg-indigo-50/50">
              <span className="block text-xs text-indigo-600 font-medium">مفتوحة</span>
              <span className="block text-xl font-bold text-indigo-700">{openTicketsCount}</span>
            </div>
            <div className="px-5 py-2 text-center bg-white/30">
              <span className="block text-xs text-slate-500 font-medium">مغلقة</span>
              <span className="block text-xl font-bold text-slate-700">{closedTicketsCount}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            إضافة عميل / تذكرة
          </button>
        </div>
      </div>

      {/* Admin Performance Banner */}
      {role === 'admin' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-indigo-900 to-slate-800 rounded-2xl p-6 shadow-md border border-indigo-200/20 text-white flex flex-col md:flex-row gap-6 justify-between items-center"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm shadow-inner">
              <BarChart3 className="w-8 h-8 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">ملخص أداء الموظفين</h3>
              <p className="text-indigo-200 text-sm mt-1">تتبع نشاطات الفريق وتوزيع التذاكر.</p>
            </div>
          </div>
          <div className="flex gap-8 border-r border-white/10 pr-8">
            <div className="text-center">
              <span className="block text-3xl font-black text-emerald-400">{openTicketsCount}</span>
              <span className="text-xs text-indigo-200 font-medium uppercase tracking-wider mt-1 block">تذاكر نشطة حالياً</span>
            </div>
            <div className="text-center">
              <span className="block pl-1 flex items-center justify-center gap-1 text-2xl font-bold text-white">
                {recentTransfers} <span className="text-sm font-normal text-indigo-300">تحويل</span>
              </span>
              <span className="text-xs text-indigo-200 font-medium uppercase tracking-wider mt-1 block">عمليات تحويل بينية</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-bold text-white truncate max-w-[100px]">{topEmployee}</span>
              <span className="text-xs text-indigo-200 font-medium uppercase tracking-wider mt-1 block">الموظف الأنشط</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col lg:flex-row gap-4 justify-between items-center z-10 relative">
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="بحث في أسماء العملاء، المواقع، الهواتف..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
          />
        </div>
        
        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto overflow-x-auto pb-2 sm:pb-0">
          {/* Employee Filter (Admin Only) */}
          {role === 'admin' && (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4 border-r ml-2 pr-4 lg:border-r-0 lg:ml-0 lg:pr-0">
              <User className="w-4 h-4 text-slate-400" />
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="الكل">كل الموظفين</option>
                {uniqueEmployees.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2">
            {['الكل', 'جديد', 'جاري المتابعة', 'محول', 'بانتظار التقييم', 'مغلق'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                  statusFilter === status 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* View Mode Toggle (Admin Only Option, or for everyone) */}
          {role === 'admin' && (
            <div className="flex border border-slate-200 rounded-xl overflow-hidden ml-auto shrink-0 bg-slate-50">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm rounded-lg' : 'text-slate-400 hover:text-slate-600'}`}
                title="عرض البطاقات"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm rounded-lg' : 'text-slate-400 hover:text-slate-600'}`}
                title="عرض الجدول"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Content */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {filteredTickets.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <UsersIcon className="w-16 h-16 mx-auto text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-900">لا يوجد عملاء يطابقون بحثك</h3>
              <p className="text-slate-500 mt-2 font-medium">جرب تغيير كلمات البحث أو فلاتر الموظفين والحالة.</p>
              <button 
                onClick={() => { setSearchTerm(''); setStatusFilter('الكل'); setEmployeeFilter('الكل'); }}
                className="mt-6 px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW (Cards) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-2xl border ${ticket.status === 'مغلق' ? 'border-slate-200 opacity-80' : 'border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1'} overflow-hidden transition-all flex flex-col group`}
                >
                  <div className={`p-4 border-b ${ticket.status === 'مغلق' ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100'} flex justify-between items-start relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-1.5 h-full" style={{ backgroundColor: ticket.status === 'جديد' ? '#10b981' : ticket.status === 'جاري المتابعة' ? '#6366f1' : ticket.status === 'محول' ? '#f59e0b' : '#cbd5e1' }} />
                    <div className="pr-2">
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-700 transition-colors">{ticket.clientName}</h3>
                      <div className="flex items-center gap-2 mt-1.5 text-slate-500 text-sm font-mono bg-slate-50 w-fit px-2 py-0.5 rounded-md">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span dir="ltr">{ticket.mobileNumber}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${
                      ticket.status === 'جديد' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      ticket.status === 'جاري المتابعة' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                      ticket.status === 'محول' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      ticket.status === 'بانتظار التقييم' ? 'bg-orange-100 text-orange-700 border-orange-300 shadow-sm shadow-orange-200/50' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  <div className="p-5 flex-1 space-y-4 bg-slate-50/30">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1 truncate" title={ticket.location}>{ticket.location}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{ticket.clientType}</span>
                      </div>
                    </div>

                    {/* Admin Specific details inside card */}
                    {role === 'admin' && (
                      <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 mt-2">
                        <div>
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-0.5">الموظف الحالي</p>
                          <p className="text-sm font-semibold text-indigo-900 flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs">{ticket.currentOwnerName.charAt(0)}</div>
                            {ticket.currentOwnerName}
                          </p>
                        </div>
                        {ticket.currentOwnerId !== ticket.createdBy && (
                          <div className="text-left">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">المنشئ</p>
                            <p className="text-xs font-medium text-slate-600">{ticket.createdByName}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="pt-3">
                      <p className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">الحاجة الأساسية للعميل:</p>
                      <p className="text-sm text-slate-800 line-clamp-2 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl shadow-sm">{ticket.clientNeed}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-auto">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{ticket.updates.length} تحديثات</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span dir="ltr">{format(new Date(ticket.updatedAt), 'MM/dd HH:mm')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center group-hover:bg-indigo-50/30 transition-colors">
                    {ticket.currentOwnerId !== ticket.createdBy && role === 'employee' ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1.5 rounded-md">
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        محوّلة إليك
                      </div>
                    ) : <div />}
                    <Link 
                      to={`/customers/${ticket.id}`}
                      className="ml-auto px-5 py-2.5 bg-slate-900 text-white shadow-md shadow-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                    >
                      عرض وتقييم التذكرة
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* TABLE VIEW (Admin only preferred) */
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">معرف التذكرة</th>
                      <th className="px-6 py-4">اسم العميل</th>
                      <th className="px-6 py-4">الجوال</th>
                      <th className="px-6 py-4 text-center">الحالة</th>
                      <th className="px-6 py-4">الموظف الحالي</th>
                      <th className="px-6 py-4">آخر تحديث</th>
                      <th className="px-6 py-4">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-4 font-mono text-slate-500 text-xs">{ticket.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{ticket.clientName}</div>
                          <div className="text-slate-500 text-xs mt-0.5 truncate max-w-[200px]">{ticket.location}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600" dir="ltr">{ticket.mobileNumber}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                            ticket.status === 'جديد' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            ticket.status === 'جاري المتابعة' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            ticket.status === 'محول' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            ticket.status === 'بانتظار التقييم' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                              {ticket.currentOwnerName.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-700">{ticket.currentOwnerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span dir="ltr" className="text-xs">{format(new Date(ticket.updatedAt), 'MM/dd')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link 
                            to={`/customers/${ticket.id}`}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors"
                          >
                            عرض الملف
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
