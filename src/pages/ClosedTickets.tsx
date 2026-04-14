import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Search, Star, TrendingUp, XCircle, Clock, Phone, User, Calendar, Filter } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useRole } from '../contexts/RoleContext';
import { format } from 'date-fns';
import { Ticket } from '../data/mockData';

export function ClosedTickets() {
  const { role } = useRole();
  const { tickets } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<'الكل' | 'مبيع' | 'لم يتم' | 'مؤجل'>('الكل');
  const [employeeFilter, setEmployeeFilter] = useState('الكل');

  const closedTickets = tickets.filter(t => t.status === 'مغلق' && t.closingReport);

  const uniqueEmployees = Array.from(new Set(closedTickets.map(t => t.currentOwnerName)));

  const filtered = closedTickets.filter(t => {
    const matchesSearch = !searchTerm || t.clientName.includes(searchTerm) || t.mobileNumber.includes(searchTerm);
    const matchesResult = resultFilter === 'الكل' || t.closingReport?.result === resultFilter;
    const matchesEmployee = employeeFilter === 'الكل' || t.currentOwnerName === employeeFilter;
    return matchesSearch && matchesResult && matchesEmployee;
  }).sort((a, b) => new Date(b.closedAt || b.updatedAt).getTime() - new Date(a.closedAt || a.updatedAt).getTime());

  // Stats
  const salesCount = closedTickets.filter(t => t.closingReport?.result === 'مبيع').length;
  const notCompletedCount = closedTickets.filter(t => t.closingReport?.result === 'لم يتم').length;
  const postponedCount = closedTickets.filter(t => t.closingReport?.result === 'مؤجل').length;
  const totalRevenue = closedTickets
    .filter(t => t.closingReport?.result === 'مبيع')
    .reduce((sum, t) => sum + (t.closingReport?.finalValue || 0), 0);

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'مبيع': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'لم يتم': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'مؤجل': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'مبيع': return <TrendingUp className="w-4 h-4" />;
      case 'لم يتم': return <XCircle className="w-4 h-4" />;
      case 'مؤجل': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  const renderStars = (count: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= count ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-transparent'}`} />
      ))}
    </div>
  );

  if (role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700">صلاحيات وصول مقيدة</h2>
        <p className="text-slate-500 mt-2">هذه الصفحة متاحة للمشرفين فقط.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">سجل الاعتمادات</h1>
        <p className="text-slate-500 mt-1">جميع التذاكر المغلقة والمعتمدة مع تقارير التقييم.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المغلقة', value: closedTickets.length, color: 'text-slate-700', bg: 'bg-white' },
          { label: 'مبيع', value: salesCount, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'لم يتم', value: notCompletedCount, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'مؤجل', value: postponedCount, color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${stat.bg} rounded-xl border border-slate-200 p-4 text-center`}
          >
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {totalRevenue > 0 && (
        <div className="bg-gradient-to-l from-emerald-50 to-white rounded-xl border border-emerald-200 p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-700">إجمالي المبيعات المعتمدة</span>
          <span className="text-xl font-black text-emerald-700">{totalRevenue.toLocaleString('ar-SA')} ر.س</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو الرقم..."
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-slate-400" />
          {(['الكل', 'مبيع', 'لم يتم', 'مؤجل'] as const).map(r => (
            <button
              key={r}
              onClick={() => setResultFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                resultFilter === r
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {uniqueEmployees.length > 1 && (
          <select
            value={employeeFilter}
            onChange={e => setEmployeeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="الكل">كل الموظفين</option>
            {uniqueEmployees.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">لا توجد تذاكر مغلقة تطابق الفلاتر</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                to={`/customers/${ticket.id}`}
                className="block bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Main Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-900">{ticket.clientName}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${getResultBadge(ticket.closingReport?.result || '')}`}>
                        {getResultIcon(ticket.closingReport?.result || '')}
                        {ticket.closingReport?.result}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{ticket.mobileNumber}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{ticket.currentOwnerName}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {ticket.closedAt ? format(new Date(ticket.closedAt), 'yyyy/MM/dd') : '—'}
                      </span>
                    </div>
                    {ticket.closingReport?.notes && (
                      <p className="text-xs text-slate-400 line-clamp-1">{ticket.closingReport.notes}</p>
                    )}
                  </div>

                  {/* Financials & Ratings */}
                  <div className="flex items-center gap-6 md:gap-8">
                    {ticket.closingReport?.result === 'مبيع' && ticket.closingReport.finalValue > 0 && (
                      <div className="text-left">
                        <p className="text-xs text-slate-400">القيمة</p>
                        <p className="text-sm font-bold text-emerald-700">{ticket.closingReport.finalValue.toLocaleString('ar-SA')} ر.س</p>
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-xs text-slate-400 mb-0.5">تقييم الموظف</p>
                      {renderStars(ticket.closingReport?.employeeEvaluation || 0)}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
