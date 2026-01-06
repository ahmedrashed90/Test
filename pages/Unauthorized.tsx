
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-mzj-cream flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-12 rounded-[40px] shadow-xl border border-mzj-beige/20">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-3xl mx-auto">
          <i className="fa-solid fa-lock"></i>
        </div>
        <h2 className="text-2xl font-black text-mzj-brown">عذراً، لا تملك صلاحية الوصول</h2>
        <p className="text-gray-500 text-sm font-medium">هذه الصفحة غير مسموح بها لدورك الوظيفي الحالي. يرجى مراجعة إدارة النظام إذا كنت تعتقد أن هناك خطأ.</p>
        <Link 
          to="/"
          className="inline-block bg-mzj-brown text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-mzj-brown/20 hover:scale-105 active:scale-95 transition-all"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
