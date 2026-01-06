
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Car } from '../types';
import { GROUPS, isSoldRow, isActualRow, isAgency, isLiveStock } from '../constants';

const Dashboard = () => {
  const [stock, setStock] = useState<Car[]>([]);
  const [salesStats, setSalesStats] = useState({ total: 0, pending: 0, tracking: 0, done: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) setStock(snap.data().stock || []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // حساب النواقص بالـ ComboKey
  const calculateShortages = () => {
    const comboMap: Record<string, Record<string, number>> = {};
    const branches = ['BR1', 'BR2', 'BR3'];
    const refStock = stock.filter(r => isActualRow(r.location));

    refStock.forEach(car => {
      const key = `${car.car}|${car.variant}|${car.intColor}|${car.extColor}|${car.modelYear}`;
      if (!comboMap[key]) comboMap[key] = { total: 0, BR1: 0, BR2: 0, BR3: 0 };
      comboMap[key].total++;
      if (car.location.includes('فرع 1')) comboMap[key].BR1++;
      if (car.location.includes('فرع 2')) comboMap[key].BR2++;
      if (car.location.includes('فرع 3')) comboMap[key].BR3++;
    });

    let shortagesCount = 0;
    Object.values(comboMap).forEach(counts => {
      if (counts.total > 0) {
        if (counts.BR1 === 0) shortagesCount++;
        if (counts.BR2 === 0) shortagesCount++;
        if (counts.BR3 === 0) shortagesCount++;
      }
    });
    return shortagesCount;
  };

  const totalLive = stock.filter(r => isLiveStock(r.location)).length;
  const agencyCount = stock.filter(r => isAgency(r.location) && isLiveStock(r.location)).length;
  const availableCount = totalLive - agencyCount;
  const notesCount = stock.filter(r => (r.notes || r.adminNotes || r.financeNotes) || r.location.includes('سيارات بها ملاحظات')).length;

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* كارت النواقص */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-widest">النواقص — الفروع فقط</h3>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-black text-red-500">{calculateShortages()}</span>
            <div className="flex gap-1">
              <span className="px-2 py-1 bg-gray-50 text-[9px] font-black rounded-lg">فرع 1</span>
              <span className="px-2 py-1 bg-gray-50 text-[9px] font-black rounded-lg">فرع 2</span>
              <span className="px-2 py-1 bg-gray-50 text-[9px] font-black rounded-lg">فرع 3</span>
            </div>
          </div>
        </div>

        {/* كارت المخزون */}
        <div className="lg:col-span-2 bg-brown text-white p-8 rounded-[2.5rem] shadow-xl shadow-brown/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-black text-white/60 text-xs uppercase tracking-widest">إجمالي المخزون الحي</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black">الوكالة: {agencyCount}</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black">المتاح: {availableCount}</span>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-5xl font-black">{totalLive}</span>
              <div className="text-left">
                <p className="text-[10px] font-black text-white/40 mb-1">بها ملاحظات</p>
                <span className="text-xl font-black text-beige">{notesCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* كارت المبيعات ERP */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xs font-black text-gray-400 mb-4 uppercase">تتبع طلبات البيع</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-gray-50 rounded-2xl text-center">
              <p className="text-[9px] font-black text-gray-400">تحت المتابعة</p>
              <p className="text-lg font-black text-brown">0</p>
            </div>
            <div className="p-3 bg-green-50 rounded-2xl text-center">
              <p className="text-[9px] font-black text-green-600">مكتملة</p>
              <p className="text-lg font-black text-green-700">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {GROUPS.map(group => {
          const members = stock.filter(r => group.members.includes(r.location));
          const actual = members.filter(r => isActualRow(r.location)).length;
          const keys = members.filter(r => r.location.includes('مباع تحت التسليم') || isActualRow(r.location)).length;
          
          return (
            <div key={group.key} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm group hover:shadow-xl transition-all duration-500 overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-beige/5 rounded-2xl flex items-center justify-center text-brown text-2xl group-hover:scale-110 transition-transform">
                      <i className={`fa-solid ${group.icon}`}></i>
                    </div>
                    <h3 className="font-black text-brown text-lg">{group.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase">إجمالي فعلي</p>
                    <span className="text-3xl font-black text-brown">{actual}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50 hover:bg-white hover:border-beige/20 transition-all cursor-pointer">
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div>متاح</span>
                    <span className="font-black text-brown">{members.filter(r => r.location.endsWith('المخزون المتاح')).length}</span>
                  </div>
                  <div className="flex justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50 hover:bg-white hover:border-beige/20 transition-all cursor-pointer">
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400"></div>ملاحظات</span>
                    <span className="font-black text-brown">{members.filter(r => r.location.includes('سيارات بها ملاحظات')).length}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400">إجمالي المفاتيح</span>
                    <span className="text-lg font-black text-beige">{keys}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Dashboard;
