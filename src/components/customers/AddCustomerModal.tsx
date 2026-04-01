import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockTickets } from '../../data/mockData';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    
    // Check if phone exists in mock data
    const exists = mockTickets.some(t => t.mobileNumber === value);
    if (exists) {
      setPhoneError('هذا العميل مسجل مسبقاً في النظام');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneError) return;
    
    // In a real app, we would save the data here
    onClose();
    setPhone('');
    setPhoneError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="p-6 overflow-y-auto" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone Number (Primary Key) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    رقم الجوال <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-left ${
                        phoneError 
                          ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' 
                          : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                      }`}
                      placeholder="05X XXX XXXX"
                      dir="ltr"
                    />
                  </div>
                  {phoneError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-rose-500 flex items-center gap-1.5 font-medium"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {phoneError}
                    </motion.p>
                  )}
                </div>

                {/* Customer Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    اسم العميل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="الاسم الكامل"
                  />
                </div>

                {/* Customer Type */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    نوع العميل <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="">اختر نوع العميل...</option>
                    <option value="فرد">فرد</option>
                    <option value="شركة">شركة</option>
                    <option value="مزرعة">مزرعة</option>
                  </select>
                </div>

                {/* Location (City/Region) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    الموقع (المدينة / المنطقة) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="مثال: الرياض - حي الملقا"
                  />
                </div>

                {/* Location (Google Maps Link) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    رابط الموقع (خرائط جوجل)
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left"
                    placeholder="https://maps.google.com/..."
                    dir="ltr"
                  />
                </div>

                {/* Requirement Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    وصف الاحتياج <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    placeholder="شرح تفصيلي لاحتياج العميل وما يبحث عنه..."
                  />
                </div>

                {/* Employee Opinion */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    رأي الموظف بالعميل <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    placeholder="تقييمك المبدئي للعميل، جديته، وملاحظاتك الشخصية..."
                  />
                </div>
              </div>

              <div className="pt-8 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!!phoneError}
                  className={`px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow-sm ${
                    phoneError 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  }`}
                >
                  حفظ وإضافة العميل
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
