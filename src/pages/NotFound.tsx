import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-2 border-b-0">404</h1>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">الصفحة غير موجودة</h2>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يرجى التأكد من الرابط أو العودة للرئيسية.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          <Home className="w-5 h-5" />
          <span>العودة للرئيسية</span>
        </Link>
      </motion.div>
    </div>
  );
}
