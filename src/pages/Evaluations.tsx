import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Star, ShieldCheck, AlertTriangle, User, FileText, ArrowLeftRight, Clock, Store, X } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';
import { Ticket } from '../data/mockData';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function Evaluations() {
  const { role } = useRole();
  const { tickets, evaluateTicket, sendNotification } = useData();

  const [activeTicketUrl, setActiveTicketUrl] = useState<string | null>(null);
  const activeTicket = useMemo(() => tickets.find(t => t.id === activeTicketUrl), [activeTicketUrl, tickets]);
  
  const [evalResult, setEvalResult] = useState<'مبيع' | 'لم يتم' | 'مؤجل'>('مبيع');
  const [evalOriginalValue, setEvalOriginalValue] = useState(0);
  const [evalFinalValue, setEvalFinalValue] = useState(0);
  const [evalEmployee, setEvalEmployee] = useState(5);
  const [evalTransferredEmployee, setEvalTransferredEmployee] = useState(5);
  const [evalBranch, setEvalBranch] = useState(5);
  const [evalNotes, setEvalNotes] = useState('');

  const targetTickets = tickets.filter(t => t.status === 'بانتظار التقييم');

  // Prevent employees from viewing this page content completely
  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-32 text-slate-500">
        <ShieldCheck className="w-20 h-20 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700">صلاحيات وصول مقيدة</h2>
        <p className="text-sm mt-2">هذه الصفحة مخصصة لمدراء النظام والمشرفين فقط لإجراء الاعتمادات والتقييم.</p>
      </div>
    );
  }

  const handleOpenEvaluation = (ticket: Ticket) => {
    setActiveTicketUrl(ticket.id);
    setEvalResult(ticket.preliminaryResult || 'مبيع');
    setEvalOriginalValue(0);
    setEvalFinalValue(0);
    setEvalEmployee(5);
    setEvalTransferredEmployee(5);
    setEvalBranch(5);
    setEvalNotes('');
  };

  const handleApproveClosure = async () => {
    if (!activeTicket) return;

    if (evalResult === 'مبيع' && evalFinalValue === 0) {
      toast.error('يجب إدخال القيمة النهائية للبيع لتحسب في الإحصائيات');
      return;
    }

    const isTransferred = activeTicket.createdBy !== activeTicket.currentOwnerId;
    const closingReport = {
      result: evalResult,
      originalValue: evalOriginalValue,
      finalValue: evalFinalValue,
      employeeEvaluation: evalEmployee,
      branchEvaluation: evalBranch,
      notes: evalNotes,
      ...(isTransferred && {
        transferredEmployeeEvaluation: evalTransferredEmployee,
        transferredEmployeeId: activeTicket.currentOwnerId,
        transferredEmployeeName: activeTicket.currentOwnerName,
      }),
    };

    const ok = await evaluateTicket(activeTicket.id, closingReport, activeTicket.closeReason);
    if (!ok) { toast.error('فشل حفظ التقييم'); return; }

    // إشعار الموظف الحالي
    await sendNotification(
      activeTicket.currentOwnerId,
      'ملف معتمد ومُقيّم',
      `تم اعتماد إغلاق تذكرة العميل "${activeTicket.clientName}" بتقييم ${evalEmployee} من 5 نجوم.`
    );
    // إشعار المنشئ إن كان مختلفاً
    if (isTransferred && activeTicket.createdBy) {
      await sendNotification(
        activeTicket.createdBy,
        'ملف معتمد ومُقيّم (كمنشئ للتذكرة)',
        `تم اعتماد إغلاق تذكرة العميل "${activeTicket.clientName}" التي قمت بإنشائها.`
      );
    }

    toast.success(`تم تقييم وإغلاق ملف "${activeTicket.clientName}" بنجاح!`);
    setActiveTicketUrl(null);
  };

  const StarRating = ({ value, onChange, label, subLabel }: { value: number, onChange: (v: number) => void, label: string, subLabel?: string }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
         <label className="block text-sm font-bold text-slate-900">{label}</label>
         {subLabel && <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{subLabel}</span>}
      </div>
      <div className="flex gap-1 bg-slate-50 p-2 rounded-xl border border-slate-200 justify-center">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1.5 transition-all hover:scale-110 ${star <= value ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
          >
            <Star className={`w-8 h-8 ${star <= value ? 'fill-amber-400 drop-shadow-sm' : 'fill-transparent'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-orange-400"></div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">مركز الاعتمادات والتقييم</h1>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm shadow-orange-100/50">
              <CheckCircle2 className="w-4 h-4" />
              تذاكر بانتظار إغلاقك
            </span>
          </div>
          <p className="text-slate-500 mt-2 font-medium">راجع طلبات الإغلاق المرفوعة من الموظفين، قيّم أدائهم بدقة، واعتمد إغلاق الصفقات للعمولة.</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl flex items-center gap-4 shadow-inner">
          <div className="text-center">
             <p className="text-xs text-slate-500 font-bold mb-1">الطلبات المعلقة</p>
             <p className="text-xl font-black text-rose-600 leading-none">{targetTickets.length}</p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {targetTickets.length === 0 ? (
          <div className="bg-white border text-center border-slate-200 rounded-3xl p-16 shadow-sm">
            <CheckCircle2 className="w-20 h-20 text-emerald-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-700">لقد أنجزت كل الاعتمادات!</h2>
            <p className="text-slate-500 mt-2">لا توجد حالياً أي تذاكر بحالة (بانتظار التقييم) للموظفين.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targetTickets.map((ticket, idx) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-orange-200 shadow-md shadow-orange-50/50 overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all flex flex-col group cursor-pointer"
                onClick={() => handleOpenEvaluation(ticket)}
              >
                <div className="p-5 border-b border-orange-100 bg-orange-50/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg border border-orange-200 animate-pulse">
                      يطلب الإغلاق
                    </span>
                    <span className="text-xs text-slate-400 font-mono" dir="ltr">{format(new Date(ticket.updatedAt), 'MM/dd HH:mm')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{ticket.clientName}</h3>
                  <p className="text-sm font-mono text-slate-500 mt-1">{ticket.id}</p>
                </div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> مبررات الإغلاق:</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${ticket.preliminaryResult === 'مبيع' ? 'bg-emerald-100 text-emerald-700' : ticket.preliminaryResult === 'لم يتم' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {ticket.preliminaryResult || 'غير محدد'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium line-clamp-3 leading-relaxed">
                      "{ticket.closeReason || 'لم يكتب الموظف أي مبررات أو ملاحظات للطلب.'}"
                    </p>
                  </div>
                  <div className="mt-auto pt-3 flex justify-between items-end border-t border-slate-100">
                     <div className="space-y-1">
                        <p className="text-xs text-slate-400">محول من: {ticket.createdByName}</p>
                        <p className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          رفعه: {ticket.currentOwnerName}
                        </p>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <ArrowLeftRight className="w-4 h-4" />
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Evaluation Modal */}
      <AnimatePresence>
        {activeTicketUrl && activeTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  اعتماد إغلاق وتقييم أداء: {activeTicket.clientName}
                </h3>
                <button onClick={() => setActiveTicketUrl(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-colors bg-white border border-slate-200 shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 max-h-[75vh] overflow-y-auto bg-slate-50/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:divide-x lg:divide-x-reverse divide-slate-200">
                  
                  {/* Right Column - Results and Finances */}
                  <div className="space-y-8">
                    {/* Reason given by employee */}
                    <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl shadow-sm">
                       <h4 className="text-sm font-bold text-orange-800 flex items-center justify-between gap-2 mb-2">
                         <span className="flex items-center gap-2">
                           <AlertTriangle className="w-4 h-4" />
                           مبررات طلب الإغلاق للموظف
                         </span>
                         <span className="bg-white/50 px-2 py-0.5 rounded textxs">النتيجة المطلوبة: {activeTicket.preliminaryResult || 'غير محدد'}</span>
                       </h4>
                       <p className="text-sm text-orange-900 font-medium leading-relaxed bg-white/60 p-3 rounded-lg">
                         {activeTicket.closeReason || "لم يتم توفير سبب"}
                       </p>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-slate-900 mb-3">القرار والنتيجة النهائية للحالة</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['مبيع', 'لم يتم', 'مؤجل'].map(res => (
                          <button
                            key={res}
                            type="button"
                            onClick={() => setEvalResult(res as any)}
                            className={`py-3 px-3 rounded-xl border text-sm font-bold transition-all shadow-sm ${
                              evalResult === res 
                              ? (res === 'مبيع' ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200 shadow-md ring-2 ring-emerald-500/30 scale-[1.02]' : res === 'لم يتم' ? 'bg-rose-600 border-rose-600 text-white shadow-rose-200 shadow-md ring-2 ring-rose-500/30 scale-[1.02]' : 'bg-amber-500 border-amber-500 text-white shadow-amber-200 shadow-md ring-2 ring-amber-500/30 scale-[1.02]')
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence>
                      {evalResult === 'مبيع' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-2 gap-4 bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 shadow-inner"
                        >
                          <div>
                            <label className="block text-xs font-bold text-emerald-800 mb-2">القيمة الأساسية المُقدرة (ر.س)</label>
                            <input 
                              type="number" 
                              value={evalOriginalValue}
                              onChange={(e) => setEvalOriginalValue(Number(e.target.value))}
                              className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 text-sm font-bold text-emerald-900 shadow-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black text-emerald-900 mb-2">المدفوع النهائي (ر.س) *للحسبة*</label>
                            <input 
                              type="number" 
                              value={evalFinalValue}
                              onChange={(e) => setEvalFinalValue(Number(e.target.value))}
                              className="w-full px-4 py-3 bg-white border-2 border-emerald-400 rounded-xl focus:ring-2 focus:ring-emerald-600 text-lg font-black text-emerald-900 shadow-sm" 
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Feedback notes */}
                    <div>
                      <label className="block text-sm font-black text-slate-900 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500" /> توجيهات إدارية للموظفين (ستظهر في التقرير)</label>
                      <textarea 
                        rows={4} 
                        value={evalNotes}
                        onChange={(e) => setEvalNotes(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm shadow-sm font-medium text-slate-800" 
                        placeholder="ممتاز أداء رائع! / الرجاء التركيز أكثر على المتابعة الدورية..."
                      />
                    </div>
                  </div>

                  {/* Left Column - Ratings */}
                  <div className="space-y-6 lg:pl-8 pt-8 lg:pt-0">
                    <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl shadow-sm space-y-6">
                      <h4 className="text-lg font-black text-indigo-900 border-b border-indigo-200/50 pb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-indigo-600" />
                        التقييم الفني للأداء
                      </h4>
                      
                      {/* Rating Employee 1 (Original Creator) */}
                      <StarRating 
                        value={evalEmployee} 
                        onChange={setEvalEmployee} 
                        label="تقييم المنشئ أو الموظف الأول" 
                        subLabel={activeTicket.createdByName} 
                      />

                      {/* Explicitly show Dual Evaluation if it was transferred */}
                      {activeTicket.createdBy !== activeTicket.currentOwnerId && (
                        <div className="pt-4 border-t border-indigo-200/50 relative">
                           <div className="absolute -top-3 right-6 bg-indigo-100 px-3 py-0.5 rounded-full text-xs font-bold text-indigo-600 flex items-center gap-1 border border-indigo-200">
                             <ArrowLeftRight className="w-3 h-3" />
                             تذكرة مُحوَّلة
                           </div>
                           <StarRating 
                             value={evalTransferredEmployee} 
                             onChange={setEvalTransferredEmployee} 
                             label="تقييم الموظف المستلم (رافع الطلب)" 
                             subLabel={activeTicket.currentOwnerName} 
                           />
                        </div>
                      )}
                      
                      {/* Branch Rating */}
                      <div className="pt-4 border-t border-indigo-200/50">
                         <StarRating 
                           value={evalBranch} 
                           onChange={setEvalBranch} 
                           label="تقييم الكفاءة العامة للفرع/القسم" 
                         />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 rounded-b-3xl">
                <button onClick={() => setActiveTicketUrl(null)} className="px-5 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">
                  العودة دون تدخل
                </button>
                <button 
                  onClick={handleApproveClosure}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:scale-[1.02] flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  اعتماد التقييم وأرشفة التذكرة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
