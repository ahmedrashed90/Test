
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Car } from '../types';

const CarsReport = () => {
  const [stock, setStock] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) setStock(snap.data().stock || []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Grouping logic based on Car Name, Variant, and Model Year
  const groups = stock.reduce((acc: any, car) => {
    const key = `${car.car}|${car.variant}|${car.modelYear}`;
    if (!acc[key]) {
      acc[key] = { car: car.car, variant: car.variant, modelYear: car.modelYear, count: 0 };
    }
    acc[key].count++;
    return acc;
  }, {});

  const groupList = Object.values(groups);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <div>
          <h2 className="text-2xl font-black text-brown">تقرير السيارات المجمع</h2>
          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">إحصائيات السيارات مجمعة حسب الموديل والفئة</p>
        </div>
        <button className="bg-brown text-white px-8 py-3 rounded-2xl font-black text-xs shadow-lg hover:bg-brown-dark transition-all">
          <i className="fa-solid fa-file-excel ml-2"></i>
          تصدير Excel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">إجمالي السيارات</p>
          <span className="text-2xl font-black text-brown">{stock.length}</span>
        </div>
        <div className="p-6 bg-beige/5 rounded-3xl border border-beige/10">
          <p className="text-[10px] font-black text-beige uppercase mb-1">عدد المجموعات</p>
          <span className="text-2xl font-black text-brown">{groupList.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-50">
        <table className="w-full text-sm text-right">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 border-b border-gray-50">
              <th className="px-6 py-4 font-black">السيارة</th>
              <th className="px-6 py-4 font-black">البيان / الفئة</th>
              <th className="px-6 py-4 font-black text-center">الموديل</th>
              <th className="px-6 py-4 text-center font-black">إجمالي العدد</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-20 text-center font-black text-gray-300">جاري جلب البيانات...</td></tr>
            ) : groupList.length === 0 ? (
              <tr><td colSpan={4} className="py-20 text-center font-black text-gray-300">لا توجد سيارات مسجلة</td></tr>
            ) : groupList.map((g: any, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-beige/5 transition-all">
                <td className="px-6 py-4 font-black text-brown">{g.car}</td>
                <td className="px-6 py-4 font-bold text-gray-600">{g.variant}</td>
                <td className="px-6 py-4 text-center font-black text-beige">{g.modelYear}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-block min-w-[3rem] px-4 py-1.5 bg-brown text-white rounded-xl font-black text-xs">{g.count}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CarsReport;
