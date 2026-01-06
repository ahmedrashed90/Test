
import React from 'react';
import { UserProfile } from '../types';

interface ActivityProps {
  user: UserProfile;
}

const Activity: React.FC<ActivityProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-black text-mzj-brown">سجل الحركات والنظام</h2>
        <p className="text-sm text-gray-500">تتبع كافة الإجراءات المتخذة من قبل المستخدمين</p>
      </header>
      
      <div className="bg-white p-12 rounded-3xl border border-dashed border-mzj-beige/30 text-center">
        <div className="w-20 h-20 bg-mzj-cream rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-list-check text-mzj-beige text-2xl"></i>
        </div>
        <p className="text-mzj-brown font-black">جاري تحسين سجل النشاط...</p>
        <p className="text-xs text-gray-400 mt-2 font-bold">هذا القسم متاح للعرض فقط حالياً</p>
      </div>
    </div>
  );
};

export default Activity;
