
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Car } from '../types';

const MediaReport = () => {
  const [stock, setStock] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) setStock(snap.data().stock || []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-black text-brown">مفتاح مواصفات الميديا</h2>
          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">تتبع حالة التصوير والمونتاج لكل تركيبة مواصفات</p>
        </div>
        <button className="bg-brown text-white px-8 py-3 rounded-2xl font-black text-xs shadow-lg">تصدير Excel</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-400 border-b border-gray-100">
              <th className="px-4 py-4 font-black">السيارة</th>
              <th className="px-4 py-4 font-black">اللون</th>
              <th className="px-4 py-4 font-black">الموديل</th>
              <th className="px-4 py-4 font-black">التصوير</th>
              <th className="px-4 py-4 font-black">المونتاج</th>
              <th className="px-4 py-4 font-black">داخل الأجندة</th>
            </tr>
          </thead>
          <tbody>
            {stock.slice(0, 10).map((car, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-beige/5">
                <td className="px-4 py-4 font-black text-brown">{car.car} - {car.variant}</td>
                <td className="px-4 py-4 font-bold text-gray-600">{car.extColor} / {car.intColor}</td>
                <td className="px-4 py-4 font-black text-beige">{car.modelYear}</td>
                <td className="px-4 py-4"><span className="px-2 py-1 bg-red-50 text-red-500 font-black text-[9px] rounded-lg">لم يتم</span></td>
                <td className="px-4 py-4"><span className="px-2 py-1 bg-red-50 text-red-500 font-black text-[9px] rounded-lg">لم يتم</span></td>
                <td className="px-4 py-4"><span className="px-2 py-1 bg-gray-50 text-gray-400 font-black text-[9px] rounded-lg">لا</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default MediaReport;
