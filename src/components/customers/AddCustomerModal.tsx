import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRole } from '../../contexts/RoleContext';
import { useData } from '../../contexts/DataContext';
import { ClientType } from '../../data/mockData';
import { toast } from 'sonner';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/** Normalize any Saudi phone format to 05XXXXXXXX */
function normalizePhone(raw: string): string {
  let d = raw.replace(/[\s\-()]+/g, '');
  if (d.startsWith('+966')) d = '0' + d.slice(4);
  else if (d.startsWith('966')) d = '0' + d.slice(3);
  else if (d.startsWith('5') && d.length === 9) d = '0' + d;
  return d;
}

export function AddCustomerModal({ isOpen, onClose, onSuccess }: AddCustomerModalProps) {
  const { role } = useRole();
  const { tickets, createTicket } = useData();
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientType, setClientType] = useState<ClientType>('فرد');
  const [location, setLocation] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [clientNeed, setClientNeed] = useState('');
  const [employeeOpinion, setEmployeeOpinion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = (raw: string) => {
    const normalized = normalizePhone(raw);

    if (normalized.length === 0) {
      setPhoneError('');
      return;
    }
    if (!/^\d+$/.test(normalized)) {
      setPhoneError('الرقم يجب أن يحتوي على أرقام فقط');
      return;
    }
    if (!normalized.startsWith('05')) {
      setPhoneError('الرقم يجب أن يبدأ بـ 05');
      return;
    }
    if (normalized.length !== 10) {
      setPhoneError('الرقم يجب أن يكون 10 أرقام');
      return;
    }
    const exists = tickets.some(t => normalizePhone(t.mobileNumber) === normalized);
    if (exists) {
      setPhoneError('هذا العميل مسجل مسبقاً في النظام');
      return;
    }
    setPhoneError('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    validatePhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);

    if (!normalized.startsWith('05') || normalized.length !== 10) {
      setPhoneError('الرقم يجب أن يكون 10 أرقام ويبدأ بـ 05');
      return;
    }
    if (phoneError || !clientName) return;

    setIsSubmitting(true);
    const { ticket, error } = await createTicket({
      clientName,
      mobileNumber: normalized,
      location,
      mapUrl,
      clientType,
      clientNeed,
      employeeOpinion,
    });

    setIsSubmitting(false);
    if (ticket) {
      toast.success('تمت إضافة العميل بنجاح!');
      if (onSuccess) onSuccess();
      onClose();
      setPhone(''); setPhoneError(''); setClientName('');
      setClientType('فرد'); setLocation(''); setMapUrl('');
      setClientNeed(''); setEmployeeOpinion('');
    } else {
      toast.error(error || 'حدث خطأ أثناء الحفظ، حاول مرة أخرى');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
            dir="rtl"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">إضافة عميل جديد</h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="p-6 overflow-y-auto" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">رقم الجوال <span className="text-rose-500">*</span></label>
                  <input type="tel" required value={phone} onChange={handlePhoneChange}
                    maxLength={15}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-left ${phoneError ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                    placeholder="05XXXXXXXX" dir="ltr"
                  />
                  <p className="mt-1.5 text-xs text-slate-400">يجب أن يبدأ بـ 05 ويتكون من 10 أرقام</p>
                  {phoneError && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-sm text-rose-500 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4" />{phoneError}
                    </motion.p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">اسم العميل <span className="text-rose-500">*</span></label>
                  <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="الاسم الكامل"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">نوع العميل <span className="text-rose-500">*</span></label>
                  <select required value={clientType} onChange={(e) => setClientType(e.target.value as ClientType)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="فرد">فرد</option>
                    <option value="شركة">شركة</option>
                    <option value="مزرعة">مزرعة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">الموقع (المدينة / المنطقة) <span className="text-rose-500">*</span></label>
                  <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="المنطقة / المدينة"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">رابط الموقع (خرائط جوجل)</label>
                  <input type="url" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left"
                    placeholder="https://maps.google.com/..." dir="ltr"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">وصف الاحتياج <span className="text-rose-500">*</span></label>
                  <textarea required rows={3} value={clientNeed} onChange={(e) => setClientNeed(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    placeholder="شرح تفصيلي لاحتياج العميل..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">رأي الموظف بالعميل <span className="text-rose-500">*</span></label>
                  <textarea required rows={2} value={employeeOpinion} onChange={(e) => setEmployeeOpinion(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    placeholder="تقييمك المبدئي للعميل وملاحظاتك..."
                  />
                </div>
              </div>

              <div className="pt-8 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button type="submit" disabled={!!phoneError || isSubmitting}
                  className={`px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow-sm ${phoneError || isSubmitting ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ وإضافة العميل'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
