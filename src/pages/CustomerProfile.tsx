import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { mockTickets, mockUsers } from '../data/mockData';
import { 
  ArrowRight, User, Phone, MapPin, Briefcase, Calendar, 
  MessageSquare, PhoneCall, Navigation, FileText, CheckCircle2, 
  AlertTriangle, Clock, ShieldCheck, ArrowLeftRight, Plus, X, Send
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function CustomerProfile() {
  const { id } = useParams();
  const ticket = mockTickets.find(t => t.id === id);
  
  const [activeModal, setActiveModal] = useState<'update' | 'transfer' | 'close' | null>(null);
  const [updateText, setUpdateText] = useState('');
  const [closeReason, setCloseReason] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  if (!ticket) {
    return <div className="p-8 text-center text-slate-500">العميل غير موجود</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'جاري المتابعة': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'محول': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'مغلق': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <Plus className="w-4 h-4 text-emerald-600" />;
      case 'UPDATE': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'TRANSFER': return <ArrowLeftRight className="w-4 h-4 text-amber-600" />;
      case 'CLOSE': return <CheckCircle2 className="w-4 h-4 text-slate-600" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  // Calculate ownership status
  const lastInteraction = new Date(ticket.updatedAt);
  const now = new Date('2026-03-31T10:00:00Z'); // Mock current date
  const daysSinceInteraction = Math.floor((now.getTime() - lastInteraction.getTime()) / (1000 * 3600 * 24));
  const isOwnershipActive = daysSinceInteraction <= 15;

  const handleAction = (action: string | null) => {
    if (!action) return;
    toast.success(`تم تنفيذ الإجراء بنجاح`);
    setActiveModal(null);
    setUpdateText('');
    setCloseReason('');
    setSelectedUser('');
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto pb-24">
      <div className="flex items-center gap-4">
        <Link to="/customers" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            ملف العميل: {ticket.clientName}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
          </h1>
          <p className="text-slate-500 mt-1 font-mono text-sm">ID: {ticket.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Actions */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" />
                البيانات الأساسية
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">رقم التواصل</p>
                  <p className="text-sm font-mono text-slate-900 mt-1" dir="ltr">{ticket.mobileNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">الموقع</p>
                  <p className="text-sm text-slate-900 mt-1">{ticket.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">نوع العميل</p>
                  <p className="text-sm text-slate-900 mt-1 font-medium">{ticket.clientType}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Navigation className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">الاحتياج</p>
                  <p className="text-sm text-slate-900 mt-1">{ticket.clientNeed}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">تاريخ التسجيل</p>
                  <p className="text-sm text-slate-900 mt-1 font-mono" dir="ltr">
                    {format(new Date(ticket.createdAt), 'yyyy/MM/dd HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                حالة الملكية والمتابعة
              </h3>
            </div>
            <div className="p-6 space-y-5">
              <div className={`p-4 rounded-xl border ${isOwnershipActive ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <div className="flex items-center gap-2">
                  {isOwnershipActive ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  )}
                  <h4 className={`font-bold ${isOwnershipActive ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {isOwnershipActive ? 'ملكية نشطة' : 'ملكية ساقطة'}
                  </h4>
                </div>
                <p className={`text-xs mt-2 leading-relaxed ${isOwnershipActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isOwnershipActive 
                    ? `تم آخر تفاعل منذ ${daysSinceInteraction} يوم. الملكية محفوظة للموظف الأساسي.`
                    : `تجاوز العميل 15 يوم دون تفاعل (${daysSinceInteraction} يوم). سقطت أحقية الموظف في العميل.`}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">الموظف المنشئ:</span>
                  <span className="font-bold text-slate-900">{ticket.createdByName}</span>
                </div>
                {ticket.currentOwnerId !== ticket.createdBy && (
                  <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-100">
                    <span className="text-slate-500">المالك الحالي:</span>
                    <span className="font-bold text-indigo-600 flex items-center gap-1">
                      <ArrowLeftRight className="w-3 h-3" />
                      {ticket.currentOwnerName}
                    </span>
                  </div>
                )}
              </div>

              {ticket.status !== 'مغلق' && (
                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <button onClick={() => setActiveModal('update')} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    إضافة متابعة
                  </button>
                  <button onClick={() => setActiveModal('transfer')} className="flex-1 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
                    تحويل العميل
                  </button>
                </div>
              )}
              {ticket.status !== 'مغلق' && (
                <button onClick={() => setActiveModal('close')} className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors mt-2">
                  إغلاق الملف
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Timeline & Reports */}
        <div className="lg:col-span-2 space-y-6">
          {ticket.closingReport && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500"></div>
              <div className="p-6 border-b border-slate-100 bg-emerald-50/30 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  تقرير الإغلاق
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">قيمة الطلب الأساسي</p>
                    <p className="text-lg font-bold text-slate-900">{ticket.closingReport.originalValue.toLocaleString()} ر.س</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">القيمة النهائية للبيع</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-emerald-600">{ticket.closingReport.finalValue.toLocaleString()} ر.س</p>
                      {ticket.closingReport.finalValue > ticket.closingReport.originalValue && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200 uppercase tracking-wider">
                          Upsell
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">تقييم الموظف</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} className={`w-4 h-4 ${star <= (ticket.closingReport?.employeeEvaluation || 0) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">ملاحظات التطوير</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {ticket.closingReport.notes}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                سجل المتابعة والرحلة
              </h3>
            </div>
            <div className="p-6">
              {ticket.activityLog.length > 0 ? (
                <div className="relative border-r-2 border-slate-100 pr-6 space-y-8 my-2">
                  {[...ticket.activityLog].reverse().map((log, index) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -right-[35px] top-1 w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{log.actionLabel}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono" dir="ltr">
                            {format(new Date(log.createdAt), 'yyyy/MM/dd HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">
                          {log.details}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <User className="w-3.5 h-3.5" />
                          بواسطة: <span className="font-medium text-slate-700">{log.performedByName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>لا توجد سجلات متابعة حتى الآن.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">
                  {activeModal === 'update' && 'إضافة متابعة'}
                  {activeModal === 'transfer' && 'تحويل العميل'}
                  {activeModal === 'close' && 'إغلاق الملف'}
                </h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                {activeModal === 'update' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">نص المتابعة</label>
                    <textarea 
                      rows={4} 
                      value={updateText}
                      onChange={(e) => setUpdateText(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm" 
                      placeholder="اكتب تفاصيل المتابعة أو الملاحظة هنا..."
                    />
                  </div>
                )}

                {activeModal === 'transfer' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">اختر الموظف المستهدف</label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {mockUsers.filter(u => u.id !== ticket.currentOwnerId).map(user => (
                        <button
                          key={user.id}
                          onClick={() => setSelectedUser(user.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                            selectedUser === user.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.role === 'admin' ? 'مشرف' : 'موظف'} - {user.branch}</p>
                            </div>
                          </div>
                          {selectedUser === user.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeModal === 'close' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-rose-800">تنبيه الإغلاق</h4>
                        <p className="text-xs text-rose-600 mt-1 leading-relaxed">
                          إغلاق الملف يعني انتهاء المتابعة. الملفات المغلقة تصبح للقراءة فقط ولا يمكن تعديلها أو إضافة تحديثات عليها.
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">سبب الإغلاق (إلزامي)</label>
                      <textarea 
                        rows={3} 
                        value={closeReason}
                        onChange={(e) => setCloseReason(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 text-sm" 
                        placeholder="مثال: تم البيع بنجاح، العميل غير مهتم..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  إلغاء
                </button>
                <button 
                  onClick={() => handleAction(activeModal)}
                  className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 ${
                    activeModal === 'close' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  {activeModal === 'update' && <Send className="w-4 h-4" />}
                  تأكيد وحفظ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}