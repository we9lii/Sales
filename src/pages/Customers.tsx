import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MapPin, Phone, User, Clock, MessageSquare, ArrowLeftRight, CheckCircle2, X, Users as UsersIcon } from 'lucide-react';
import { mockTickets, Ticket } from '../data/mockData';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { AddCustomerModal } from '../components/customers/AddCustomerModal';

export function Customers() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'الكل' | 'جديد' | 'جاري المتابعة' | 'محول' | 'مغلق'>('الكل');

  useEffect(() => {
    if (initialStatus === 'closed') {
      setStatusFilter('مغلق');
    }
  }, [initialStatus]);

  // Current user (mock)
  const currentUserId = 'U-2'; // سارة محمد

  // Filter tickets: created by me OR transferred to me
  const myTickets = mockTickets.filter(t => t.createdBy === currentUserId || t.currentOwnerId === currentUserId);

  const filteredTickets = myTickets.filter(t => {
    const matchesSearch = t.clientName.includes(searchTerm) || t.mobileNumber.includes(searchTerm) || t.location.includes(searchTerm);
    const matchesStatus = statusFilter === 'الكل' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openTicketsCount = myTickets.filter(t => t.status !== 'مغلق').length;
  const closedTicketsCount = myTickets.filter(t => t.status === 'مغلق').length;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <AddCustomerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">العملاء والمتابعات</h1>
          <p className="text-slate-500 mt-2">إدارة بيانات العملاء، التحويلات، ومتابعة الحالات.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-l border-slate-200 text-center">
              <span className="block text-xs text-slate-500 font-medium">إجمالي</span>
              <span className="block text-lg font-bold text-slate-900">{myTickets.length}</span>
            </div>
            <div className="px-4 py-2 border-l border-slate-200 text-center bg-indigo-50">
              <span className="block text-xs text-indigo-600 font-medium">مفتوحة</span>
              <span className="block text-lg font-bold text-indigo-700">{openTicketsCount}</span>
            </div>
            <div className="px-4 py-2 text-center bg-slate-50">
              <span className="block text-xs text-slate-500 font-medium">مغلقة</span>
              <span className="block text-lg font-bold text-slate-700">{closedTicketsCount}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            إضافة عميل / تذكرة
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="بحث في العملاء..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {['الكل', 'جديد', 'جاري المتابعة', 'محول', 'مغلق'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                statusFilter === status 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-2xl border ${ticket.status === 'مغلق' ? 'border-slate-200 opacity-75' : 'border-indigo-100 shadow-sm hover:shadow-md'} overflow-hidden transition-all flex flex-col`}
          >
            <div className={`p-4 border-b ${ticket.status === 'مغلق' ? 'bg-slate-50 border-slate-100' : 'bg-indigo-50/50 border-indigo-50'} flex justify-between items-start`}>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{ticket.clientName}</h3>
                <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm font-mono">
                  <Phone className="w-3.5 h-3.5" />
                  <span dir="ltr">{ticket.mobileNumber}</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                ticket.status === 'جديد' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                ticket.status === 'جاري المتابعة' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                ticket.status === 'محول' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {ticket.status}
              </span>
            </div>
            
            <div className="p-5 flex-1 space-y-4">
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{ticket.location}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{ticket.clientType}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">الاحتياج:</p>
                <p className="text-sm text-slate-800 line-clamp-2 leading-relaxed">{ticket.clientNeed}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{ticket.updates.length} تحديثات</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span dir="ltr">{format(new Date(ticket.updatedAt), 'MM/dd HH:mm')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              {ticket.currentOwnerId !== ticket.createdBy && (
                <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md">
                  <ArrowLeftRight className="w-3 h-3" />
                  محوّلة إليك
                </div>
              )}
              <Link 
                to={`/customers/${ticket.id}`}
                className="ml-auto px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                عرض التفاصيل
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredTickets.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <UsersIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">لا يوجد عملاء</h3>
          <p className="text-slate-500 mt-1">لم يتم العثور على عملاء يطابقون معايير البحث.</p>
        </div>
      )}
    </div>
  );
}
