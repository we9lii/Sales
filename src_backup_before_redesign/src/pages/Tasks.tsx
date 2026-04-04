import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, Calendar, Plus, User, FileText, X, ShieldCheck, Mail, Phone, CalendarDays, RefreshCw } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';
import { CRMTask } from '../data/mockData';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export function Tasks() {
  const { role } = useRole();
  const { tasks, setTasks, tickets: mockTickets, users: mockUsers } = useData();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [employeeFilter, setEmployeeFilter] = useState<string>('الكل');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<CRMTask['type']>('call');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [linkedTicketId, setLinkedTicketId] = useState(''); // NEW

  // Current Employee ID
  const currentUserId = authUser?.id || '2'; 
  const currentUserObj = mockUsers.find(u => u.id === currentUserId) || mockUsers[1];
  const adminUserObj = mockUsers.find(u => u.role === 'admin') || mockUsers[0];

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter by role
    if (role === 'employee') {
      result = result.filter(t => t.assignedToId === currentUserId);
    } else if (role === 'admin' && employeeFilter !== 'الكل') {
      result = result.filter(t => t.assignedToName === employeeFilter);
    }

    // Filter by tab status
    if (activeTab === 'active') {
      result = result.filter(t => t.status === 'pending' || t.status === 'overdue');
    } else {
      result = result.filter(t => t.status === 'completed');
    }

    // Sort: Overdue first, then pending closest date
    return result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks, role, employeeFilter, activeTab]);

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isCompleted = t.status === 'completed';
        const newStatus = isCompleted ? (new Date(t.dueDate) < new Date() ? 'overdue' : 'pending') : 'completed';
        if (!isCompleted) {
          toast.success('تم إنجاز المهمة بنجاح! نُقلت للأرشيف المكتمل.');
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const handleCreateTask = () => {
    if (!newTaskTitle || !newTaskDueDate || !linkedTicketId) {
      toast.error('الرجاء إكمال بيانات المهمة الأساسية وارتباطها بعميل.');
      return;
    }

    // Determine assigner and assignee
    const creator = role === 'admin' ? adminUserObj : currentUserObj;
    const assigneeId = role === 'admin' && assignedToId ? assignedToId : currentUserId;
    const assigneeObj = mockUsers.find(u => u.id === assigneeId) || mockUsers[1];

    // Optional ticket linking
    const ticketDetails = linkedTicketId ? mockTickets.find(t => t.id === linkedTicketId) : null;

    const newTask: CRMTask = {
      id: `TASK-${Date.now()}`,
      title: newTaskTitle,
      dueDate: new Date(newTaskDueDate).toISOString(),
      status: new Date(newTaskDueDate) < new Date() ? 'overdue' : 'pending',
      type: newTaskType,
      assignedToId: assigneeObj.id,
      assignedToName: assigneeObj.name,
      createdById: creator.id,
      createdByName: creator.name,
      createdAt: new Date().toISOString(),
      ticketId: ticketDetails?.id,
      clientName: ticketDetails?.clientName
    };
    setTasks(prev => [newTask, ...prev]);
    toast.success('تمت إضافة الجدولة بنجاح وإشعار الموظف.');
    
    // Reset
    setIsModalOpen(false);
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setAssignedToId('');
    setLinkedTicketId('');
  };

  const getTypeIcon = (type: CRMTask['type']) => {
    switch(type) {
      case 'call': return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'email': return <Mail className="w-4 h-4 text-indigo-600" />;
      case 'meeting': return <CalendarDays className="w-4 h-4 text-amber-600" />;
      case 'update': return <RefreshCw className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeLabel = (type: CRMTask['type']) => {
    switch(type) {
      case 'call': return 'مكالمة هاتفية';
      case 'email': return 'رسالة';
      case 'meeting': return 'اجتماع';
      case 'update': return 'تحديث بيانات';
    }
  };

  // Stats
  const targetTasks = role === 'admin' && employeeFilter !== 'الكل' 
    ? tasks.filter(t => t.assignedToName === employeeFilter)
    : role === 'employee' ? tasks.filter(t => t.assignedToId === currentUserId) : tasks;
  
  const activeCount = targetTasks.filter(t => t.status === 'pending' || t.status === 'overdue').length;
  const overdueCount = targetTasks.filter(t => t.status === 'overdue').length;
  const completedCount = targetTasks.filter(t => t.status === 'completed').length;
  const adminAssignedCount = targetTasks.filter(t => t.createdById !== t.assignedToId).length;

  const uniqueEmployees = Array.from(new Set(mockUsers.filter(u => u.role === 'employee').map(u => u.name)));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header and Add Task */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">إدارة المهام والمتابعات</h1>
            {role === 'admin' && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                تحكم المسؤولين
              </span>
            )}
          </div>
          <p className="text-slate-500 mt-2 font-medium">نظم وقتك، وتتبع تكليفات الفريق، واربطها بالعملاء.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {role === 'admin' ? 'تكليف موظف بمهمة' : 'إضافة مهمة شخصية'}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-medium text-xs mb-1">المهام النشطة المطلوبة</p>
          <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
        </div>
        <div className="bg-rose-50 p-5 rounded-xl border border-rose-100 shadow-sm">
          <p className="text-rose-600 font-bold text-xs mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> مهام متأخرة الموعد</p>
          <p className="text-2xl font-bold text-rose-700">{overdueCount}</p>
        </div>
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm">
          <p className="text-emerald-700 font-bold text-xs mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5"/> مهام مكتملة ومنجزة</p>
          <p className="text-2xl font-bold text-emerald-800">{completedCount}</p>
        </div>
        <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
          <p className="text-indigo-700 font-bold text-xs mb-1 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5"/> تكليفات إدارية مختارة</p>
          <p className="text-2xl font-bold text-indigo-800">{adminAssignedCount}</p>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 w-full md:w-auto p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${
              activeTab === 'active' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            المهام النشطة / المتأخرة
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${
              activeTab === 'completed' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            المهام المكتملة
          </button>
        </div>

        {role === 'admin' && (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4 w-full md:w-auto">
            <User className="w-4 h-4 text-slate-400" />
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-indigo-700 focus:outline-none cursor-pointer"
            >
              <option value="الكل">جميع الموظفين (الكل)</option>
              {uniqueEmployees.map(emp => (
                <option key={emp} value={emp}>مهام: {emp}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">
            {activeTab === 'active' ? 'قائمة الأعمال المجدولة المتبقية' : 'أرشيف الأعمال التي تم إنجازها'}
          </h3>
          <span className="text-slate-500 font-medium text-sm">
            {filteredTasks.length} مهمة معروضة
          </span>
        </div>
        
        <div className="divide-y divide-slate-100 min-h-[400px]">
          <AnimatePresence mode="wait">
            {filteredTasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center p-16 text-slate-400"
              >
                {activeTab === 'completed' ? (
                  <CheckCircle2 className="w-16 h-16 text-slate-200 mb-4" />
                ) : (
                  <FileText className="w-16 h-16 text-slate-200 mb-4" />
                )}
                <p className="text-lg font-bold text-slate-500">لا يوجد مهام حالياً</p>
                <p className="text-sm mt-1">لا توجد سجلات تطابق الفلاتر في هذا القسم.</p>
              </motion.div>
            ) : (
              filteredTasks.map((task, index) => (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-slate-50/80 transition-colors w-full gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => toggleTaskCompletion(task.id)}
                      title={task.status === 'completed' ? 'تراجع عن الإنجاز' : 'إنجاز المهمة'}
                      className={`w-7 h-7 mt-0.5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.status === 'completed' 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 text-transparent hover:border-emerald-500 hover:text-emerald-500'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`font-bold transition-all ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-amber-700'}`}>
                          {task.title}
                        </h4>
                        {task.status === 'overdue' && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md animate-pulse">
                            متأخرة!
                          </span>
                        )}
                        {task.assignedToId !== task.createdById && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            تكليف من الإدارة
                          </span>
                        )}
                        {task.clientName && (
                          <Link to={`/customers/${task.ticketId}`} className="ml-2 flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                            <User className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold underline decoration-blue-300 underline-offset-2">عميل: {task.clientName}</span>
                          </Link>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className={`w-3.5 h-3.5 ${task.status === 'overdue' ? 'text-rose-400' : 'text-slate-400'}`} />
                          <span className={`${task.status === 'overdue' ? 'text-rose-600 font-bold' : 'text-slate-500 font-medium'} font-mono`} dir="ltr">
                            {format(new Date(task.dueDate), 'yyyy/MM/dd HH:mm')}
                          </span>
                        </div>
                        {role === 'admin' && (
                          <div className="flex items-center gap-1.5 pl-4 border-l border-slate-200">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-600 font-medium">{task.assignedToName}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1.5 pl-4 border-l border-slate-200">
                          {getTypeIcon(task.type)}
                          <span className="text-slate-600 font-medium">{getTypeLabel(task.type)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-8 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                  {role === 'admin' ? 'إضافة تكليف جديد' : 'جدولة مهمة جديدة'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full border border-slate-200 shadow-sm text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">عنوان المهمة</label>
                  <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm shadow-sm" 
                    placeholder="مثال: مكالمة لمناقشة العرض المالي..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">نوع المهمة</label>
                    <select 
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value as CRMTask['type'])}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm font-medium" 
                    >
                      <option value="call">مكالمة هاتفية</option>
                      <option value="email">إيميل / رسالة</option>
                      <option value="meeting">اجتماع / زيارة</option>
                      <option value="update">تحديث وتدقيق</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ الاستحقاق</label>
                    <input 
                      type="datetime-local" 
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm shadow-sm" 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-bold text-blue-900 mb-2 flex items-center gap-1.5"><User className="w-4 h-4" /> ربط المهمة بعميل معين (إلزامي)</label>
                  <select 
                    value={linkedTicketId}
                    onChange={(e) => setLinkedTicketId(e.target.value)}
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-semibold text-blue-900" 
                  >
                    <option value="">-- اختر العميل من القائمة --</option>
                    {mockTickets.filter(t => t.status !== 'مغلق').map(ticket => (
                      <option key={ticket.id} value={ticket.id}>عميل: {ticket.clientName} | هاتف: {ticket.mobileNumber}</option>
                    ))}
                  </select>
                  {!linkedTicketId && (
                    <p className="text-xs font-semibold text-rose-500 mt-2">عليك ربط هذه المهمة بعميل</p>
                  )}
                </div>

                {role === 'admin' && (
                  <div className="pt-2">
                    <label className="block text-sm font-bold text-emerald-900 mb-2 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> تعيين التكليف لموظف</label>
                    <select 
                      value={assignedToId}
                      onChange={(e) => setAssignedToId(e.target.value)}
                      className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-bold text-emerald-900" 
                    >
                      <option value="">-- اختر الموظف --</option>
                      {mockUsers.filter(u => u.role === 'employee').map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.branch})</option>
                      ))}
                    </select>
                    {!assignedToId && (
                      <p className="text-xs font-semibold text-rose-500 mt-2">عليك تحديد الموظف لهذا التكليف</p>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  العودة وإلغاء الاضافة
                </button>
                <button 
                  onClick={handleCreateTask}
                  disabled={(role === 'admin' && !assignedToId) || !linkedTicketId}
                  className="px-6 py-2.5 bg-indigo-600 text-white shadow-md shadow-indigo-200 text-sm font-bold rounded-xl transition-all flex items-center gap-2 hover:bg-indigo-700 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Calendar className="w-5 h-5" />
                  تسجيل وإرسال التكليف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
