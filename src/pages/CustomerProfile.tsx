import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mockTasks, CRMTask, ClientType } from '../data/mockData';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowRight, User, Phone, MapPin, Briefcase, Calendar, 
  MessageSquare, Navigation, FileText, CheckCircle2, 
  AlertTriangle, Clock, ShieldCheck, ArrowLeftRight, Plus, X, Send, Star
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useRole } from '../contexts/RoleContext';

export function CustomerProfile() {
  const { id } = useParams();
  const { role } = useRole();
  const { user: authUser } = useAuth();
  const { tickets: mockTickets, updateTicket, users: mockUsers } = useData();
  const ticket = mockTickets.find(t => t.id === id);
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeModal, setActiveModal] = useState<'update' | 'transfer' | 'request_close' | 'evaluate' | 'assign_task' | 'edit_info' | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<CRMTask['type']>('call');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [updateText, setUpdateText] = useState('');
  const [closeReason, setCloseReason] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [evalResult, setEvalResult] = useState<'مبيع' | 'لم يتم' | 'مؤجل'>('مبيع');

  const [editName, setEditName] = useState(ticket?.clientName || '');
  const [editPhone, setEditPhone] = useState(ticket?.mobileNumber || '');
  const [editLocation, setEditLocation] = useState(ticket?.location || '');
  const [editType, setEditType] = useState<ClientType>(ticket?.clientType as ClientType || 'فرد');
  const [editNeed, setEditNeed] = useState(ticket?.clientNeed || '');

  if (!ticket) {
    return <div className="p-8 text-center text-slate-500">العميل غير موجود</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'جاري المتابعة': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'محول': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'بانتظار التقييم': return 'bg-orange-100 text-orange-700 border-orange-200 shadow-sm shadow-orange-100';
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
  const now = new Date();
  const daysSinceInteraction = Math.floor((now.getTime() - lastInteraction.getTime()) / (1000 * 3600 * 24));
  const isOwnershipActive = daysSinceInteraction <= 15;

  const currentUserId = authUser?.id || '';

  const handleAction = (action: string | null) => {
    if (!action || !ticket) return;
    const currentUserObj = mockUsers.find(u => u.id === authUser?.id) || mockUsers[0];

    if (action === 'assign_task') {
      if (!newTaskTitle || !newTaskDueDate) return toast.error('أكمل بيانات المهمة');
      const assigneeId = role === 'admin' && assignedToId ? assignedToId : currentUserObj.id;
      mockTasks.unshift({
        id: `TASK-${Date.now()}`,
        title: newTaskTitle,
        dueDate: new Date(newTaskDueDate).toISOString(),
        status: new Date(newTaskDueDate) < new Date() ? 'overdue' : 'pending',
        type: newTaskType,
        assignedToId: assigneeId,
        assignedToName: mockUsers.find(u => u.id === assigneeId)?.name || '',
        createdById: currentUserObj.id,
        createdByName: currentUserObj.name,
        createdAt: new Date().toISOString(),
        ticketId: ticket.id,
        clientName: ticket.clientName
      });
      toast.success(`تم إسناد التكليف بنجاح!`);
    } else if (action === 'update') {
      if (!updateText) return toast.error('أدخل النص');
      ticket.updates = ticket.updates || [];
      ticket.updates.push({
        id: `UPD-${Date.now()}`,
        note: updateText,
        updatedBy: currentUserObj.id,
        updatedByName: currentUserObj.name,
        createdAt: new Date().toISOString()
      });
      ticket.activityLog.unshift({
        id: `ACT-${Date.now()}`,
        action: 'UPDATE',
        actionLabel: 'إضافة متابعة',
        details: updateText,
        performedBy: currentUserObj.id,
        performedByName: currentUserObj.name,
        createdAt: new Date().toISOString()
      });
      ticket.updatedAt = new Date().toISOString();
      toast.success('تمت إضافة المتابعة بنجاح');
    } else if (action === 'transfer') {
      if (!selectedUser) return toast.error('اختر الموظف');
      const targetUser = mockUsers.find(u => u.id === selectedUser) || mockUsers[1];
      ticket.transfers = ticket.transfers || [];
      ticket.transfers.push({
        id: `TRF-${Date.now()}`,
        fromEmployeeId: currentUserObj.id,
        fromEmployeeName: currentUserObj.name,
        toEmployeeId: targetUser.id,
        toEmployeeName: targetUser.name,
        createdAt: new Date().toISOString()
      });
      ticket.currentOwnerId = targetUser.id;
      ticket.currentOwnerName = targetUser.name;
      ticket.status = 'محول';
      ticket.activityLog.unshift({
        id: `ACT-${Date.now()}`,
        action: 'TRANSFER',
        actionLabel: 'تحويل عميل',
        details: `تم تحويل العميل إلى המوظف ${targetUser.name}`,
        performedBy: currentUserObj.id,
        performedByName: currentUserObj.name,
        createdAt: new Date().toISOString()
      });
      ticket.updatedAt = new Date().toISOString();
      toast.success(`تم تحويل العميل إلى ${targetUser.name}`);
    } else if (action === 'request_close') {
      if (!closeReason) return toast.error('أدخل سبب الإغلاق');
      ticket.status = 'بانتظار التقييم';
      ticket.closeReason = closeReason;
      ticket.preliminaryResult = evalResult as any;
      ticket.activityLog.unshift({
        id: `ACT-${Date.now()}`,
        action: 'UPDATE',
        actionLabel: 'طلب إغلاق موجه للمشرف',
        details: `طلب إغلاق بنتيجة (${evalResult}). السبب: ${closeReason}`,
        performedBy: currentUserObj.id,
        performedByName: currentUserObj.name,
        createdAt: new Date().toISOString()
      });
      ticket.updatedAt = new Date().toISOString();
      toast.success('تم رفع طلب الإغلاق للمشرف');
    } else if (action === 'edit_info') {
      if (!editName || !editPhone) return toast.error('أكمل البيانات');
      ticket.clientName = editName;
      ticket.mobileNumber = editPhone;
      ticket.location = editLocation;
      ticket.clientNeed = editNeed;
      ticket.clientType = editType;
      ticket.activityLog.unshift({
        id: `ACT-${Date.now()}`,
        action: 'UPDATE',
        actionLabel: 'تعديل بيانات العميل',
        details: `تم تعديل بيانات العميل الأساسية من قبل الموظف.`,
        performedBy: currentUserObj.id,
        performedByName: currentUserObj.name,
        createdAt: new Date().toISOString()
      });
      ticket.updatedAt = new Date().toISOString();
      toast.success('تم حفظ التعديلات بنجاح');
    }

    updateTicket({...ticket});
    setRefreshKey(prev => prev + 1);
    setActiveModal(null);
    setUpdateText('');
    setCloseReason('');
    setSelectedUser('');
  };

  const StarRating = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="flex gap-1 bg-slate-50 p-2 rounded-lg border border-slate-200 w-fit">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 transition-colors ${star <= value ? 'text-amber-400' : 'text-slate-300 hover:text-amber-200'}`}
          >
            <Star className={`w-6 h-6 ${star <= value ? 'fill-amber-400' : 'fill-transparent'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto pb-24">
      <div className="flex items-center gap-4">
        <Link to="/customers" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            ملف العميل: {ticket.clientName}
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
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
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" />
                البيانات الأساسية
              </h3>
              <button 
                onClick={() => {
                  setEditName(ticket.clientName);
                  setEditPhone(ticket.mobileNumber);
                  setEditLocation(ticket.location);
                  setEditType(ticket.clientType as ClientType);
                  setEditNeed(ticket.clientNeed);
                  setActiveModal('edit_info');
                }}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                title="تعديل بيانات العميل"
              >
                تعديل البيانات
              </button>
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
              {ticket.status !== 'مغلق' && ticket.status !== 'بانتظار التقييم' && (
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
              )}

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

              {/* Actions for Employees and Admins */}
              {ticket.status !== 'مغلق' && ticket.status !== 'بانتظار التقييم' && (
                <>
                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <button onClick={() => setActiveModal('update')} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                      تحديث
                    </button>
                    <button onClick={() => setActiveModal('transfer')} className="flex-1 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
                      تحويل
                    </button>
                  </div>
                  <button onClick={() => setActiveModal('assign_task')} className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors mt-2">
                    إسناد تكليف أو مهمة مرتبطة
                  </button>
                  <button onClick={() => setActiveModal('request_close')} className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors mt-2">
                    إغلاق (طلب اعتماد)
                  </button>
                </>
              )}

              {/* Admin Evaluate Link */}
              {ticket.status === 'بانتظار التقييم' && role === 'admin' && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 mb-4 text-sm text-orange-800">
                    <strong className="block mb-1 text-base">مذكرة تتطلب التقييم:</strong> 
                    وجهك الموظف لتتدخل لتقييم واعتماد وإغلاق هذه التذكرة.
                  </div>
                  <Link to="/evaluations" className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 shadow-md shadow-indigo-200 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 hover:scale-[1.02] transition-all">
                    <ShieldCheck className="w-5 h-5" />
                    الذهاب لمركز الاعتمادات والتقييم
                  </Link>
                </div>
              )}
                
              {/* Employee view if waiting for evaluation */}
              {ticket.status === 'بانتظار التقييم' && role === 'employee' && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-sm text-orange-800 text-center font-medium shadow-inner shadow-orange-100/50">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-orange-500 animate-pulse" />
                    تم رفع طلب الإغلاق.. بانتظار تقييم المشرف النهائي لاعتماد إغلاق الملف.
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Timeline & Reports */}
        <div className="lg:col-span-2 space-y-6">
          {ticket.closingReport && ticket.status === 'مغلق' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500"></div>
              <div className="p-6 border-b border-slate-100 bg-emerald-50/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  تقرير التقييم والإغلاق النهائي
                </h3>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${ticket.closingReport.result === 'مبيع' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ticket.closingReport.result === 'مؤجل' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  نتيجة الحالة: {ticket.closingReport.result}
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {ticket.closingReport.result === 'مبيع' && (
                    <div className="flex gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-50">
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium mb-1">قيمة الطلب الأساسي</p>
                        <p className="text-lg font-bold text-slate-900">{ticket.closingReport.originalValue.toLocaleString()} ر.س</p>
                      </div>
                      <div className="w-px bg-emerald-100 mx-2"></div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium mb-1">القيمة النهائية</p>
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
                  )}
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-2 uppercase">ملاحظات المشرف:</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                      {ticket.closingReport.notes}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6 border-t md:border-t-0 md:border-r border-slate-100 pt-6 md:pt-0 md:pr-8">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-bold text-slate-900">تقييم أداء الموظف</p>
                      <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">{ticket.closingReport.employeeEvaluation} / 5</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-5 h-5 ${star <= (ticket.closingReport?.employeeEvaluation || 0) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-bold text-slate-900">تقييم تجربة الفرع</p>
                      <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">{ticket.closingReport.branchEvaluation} / 5</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-5 h-5 ${star <= (ticket.closingReport?.branchEvaluation || 0) ? 'fill-blue-400 text-blue-400' : 'fill-slate-100 text-slate-200'}`} />
                      ))}
                    </div>
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
                  {[...ticket.activityLog].reverse().map((log) => (
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className={`bg-white rounded-3xl shadow-2xl w-full my-8 overflow-hidden ${activeModal === 'evaluate' ? 'max-w-3xl' : 'max-w-lg'}`}
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900">
                  {activeModal === 'update' && 'إضافة متابعة'}
                  {activeModal === 'transfer' && 'تحويل العميل'}
                  {activeModal === 'request_close' && 'طلب إغلاق الملف'}
                  {activeModal === 'assign_task' && 'إضافة تكليف مرتبط بالعميل'}
                  {activeModal === 'edit_info' && 'تعديل بيانات العميل'}
                </h3>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {activeModal === 'edit_info' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">اسم العميل</label>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">رقم التواصل</label>
                      <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 text-sm" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">الموقع</label>
                      <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">نوع العميل</label>
                      <select value={editType} onChange={(e) => setEditType(e.target.value as ClientType)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 text-sm">
                         <option value="فرد">فرد</option>
                         <option value="شركة">شركة</option>
                         <option value="مزرعة">مزرعة</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">الاحتياج</label>
                      <textarea value={editNeed} onChange={(e) => setEditNeed(e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 text-sm resize-none" />
                    </div>
                  </div>
                )}
                {activeModal === 'update' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">نص المتابعة</label>
                    <textarea 
                      rows={4} 
                      value={updateText}
                      onChange={(e) => setUpdateText(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm shadow-sm" 
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
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                            selectedUser === user.id ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedUser === user.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              <User className="w-5 h-5" />
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{user.role === 'admin' ? 'مشرف' : 'موظف'} - {user.branch}</p>
                            </div>
                          </div>
                          {selectedUser === user.id && <CheckCircle2 className="w-6 h-6 text-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeModal === 'assign_task' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">عنوان المهمة الجديدة</label>
                      <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm shadow-sm" placeholder="مثال: مكالمة العميل لمناقشة العرض المالي..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">نوع المهمة</label>
                        <select value={newTaskType} onChange={(e) => setNewTaskType(e.target.value as CRMTask['type'])} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-medium">
                          <option value="call">مكالمة هاتفية</option>
                          <option value="email">إيميل / رسالة</option>
                          <option value="meeting">اجتماع / زيارة</option>
                          <option value="update">تحديث نظام</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">موعد التنفيذ</label>
                        <input type="datetime-local" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm shadow-sm" />
                      </div>
                    </div>
                    {role === 'admin' && (
                      <div>
                        <label className="block text-sm font-bold text-emerald-900 mb-2 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> تعيين المهمة للموظف (للتكليف)</label>
                        <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-bold text-emerald-900">
                          <option value="">-- اختر الموظف --</option>
                          {mockUsers.filter(u => u.role === 'employee').map(user => (
                            <option key={user.id} value={user.id}>{user.name} ({user.branch})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {activeModal === 'request_close' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-orange-800">تنويه طلب الإغلاق</h4>
                        <p className="text-xs text-orange-700 mt-1.5 leading-relaxed">
                          طلب إغلاق الملف سيحيل التذكرة للمشرف بحالة (بانتظار التقييم) لإجراء التقييم النهائي ولن تتمكن من التعديل عليها ماالم يتم رفض الطلب.
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3">نتيجة التذكرة (تحديد مبدئي)</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['مبيع', 'لم يتم', 'مؤجل'].map(res => (
                          <button
                            key={res}
                            type="button"
                            onClick={() => setEvalResult(res as any)}
                            className={`py-2 px-3 rounded-xl border text-sm font-bold transition-all ${
                              evalResult === res 
                              ? (res === 'مبيع' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : res === 'لم يتم' ? 'bg-rose-600 border-rose-600 text-white shadow-md' : 'bg-amber-500 border-amber-500 text-white shadow-md')
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات وسبب الإغلاق (للمشرف)</label>
                      <textarea 
                        rows={4} 
                        value={closeReason}
                        onChange={(e) => setCloseReason(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-sm shadow-sm" 
                        placeholder="أدخل مبررات الإغلاق للنتيجة المحددة أعلاه..."
                      />
                    </div>
                  </div>
                )}

                
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
                <button onClick={() => setActiveModal(null)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  إلغاء التعديل
                </button>
                <button 
                  onClick={() => handleAction(activeModal)}
                  className={`px-6 py-2.5 text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 ${
                    activeModal === 'request_close' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200 hover:scale-105' : 
                    activeModal === 'assign_task' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 hover:scale-105' : 
                    'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 hover:scale-105'
                  }`}
                >
                  {activeModal === 'update' && <Send className="w-4 h-4" />}
                  {activeModal === 'request_close' && <CheckCircle2 className="w-4 h-4" />}
                  {activeModal === 'assign_task' && <Calendar className="w-4 h-4" />}
                  {
                    activeModal === 'request_close' ? 'رفع الطلب للمشرف' :
                    activeModal === 'assign_task' ? 'حفظ واسناد المهمة' : 
                    'تأكيد وحفظ'
                  }
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}