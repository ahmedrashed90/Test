
import React from 'react';
import { UserProfile } from '../types';

interface VTProps {
  user: UserProfile;
}

const VT: React.FC<VTProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-black text-mzj-brown">نقل السيارات (VT)</h2>
        <p className="text-sm text-gray-500">تسجيل ومتابعة طلبات نقل الملكية واللوحات</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-mzj-beige/20 shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-mzj-cream text-mzj-brown rounded-2xl flex items-center justify-center text-3xl">
            <i className="fa-solid fa-file-invoice"></i>
          </div>
          <h3 className="font-black text-mzj-brown">إنشاء طلب VT جديد</h3>
          <p className="text-xs text-gray-400 font-bold">يرجى استخدام نموذج الطلبات المركزي</p>
          <button className="bg-mzj-brown text-white px-8 py-3 rounded-2xl font-black text-xs">فتح نموذج الطلب</button>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-mzj-beige/20 shadow-sm flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 bg-mzj-cream text-mzj-beige rounded-2xl flex items-center justify-center text-3xl">
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
          <h3 className="font-black text-mzj-brown">طلبات بانتظار المراجعة</h3>
          <p className="text-xs text-gray-400 font-bold">سيتم عرض قائمة الانتظار هنا قريباً</p>
        </div>
      </div>
    </div>
  );
};

export default VT;
