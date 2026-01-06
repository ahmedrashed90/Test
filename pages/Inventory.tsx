
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Car, Move } from '../types';
import { FIXED_LOCATIONS } from '../constants';

const Inventory = () => {
  const [stock, setStock] = useState<Car[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) {
        setStock(snap.data().stock || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredStock = stock.filter(car => {
    const q = search.toLowerCase();
    return (
      car.vin?.toLowerCase().includes(q) ||
      car.car?.toLowerCase().includes(q) ||
      car.variant?.toLowerCase().includes(q) ||
      car.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-black text-brown flex items-center gap-3">
            <i className="fa-solid fa-boxes-stacked text-beige"></i>
            المخزون الحالي
          </h2>
          <div className="relative flex-1 max-w-md">
            <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="بحث في المخزون (VIN، السيارة، الفئة...)"
              className="w-full pr-11 pl-4 py-3 rounded-2xl border border-gray-200 focus:border-beige focus:ring-4 focus:ring-beige/10 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-4 text-right text-xs font-black text-brown uppercase">#</th>
                <th className="px-4 py-4 text-right text-xs font-black text-brown uppercase">السيارة</th>
                <th className="px-4 py-4 text-right text-xs font-black text-brown uppercase">الفئة</th>
                <th className="px-4 py-4 text-right text-xs font-black text-brown uppercase">الموديل</th>
                <th className="px-4 py-4 text-right text-xs font-black text-brown uppercase">VIN</th>
                <th className="px-4 py-4 text-right text-xs font-black text-brown uppercase">المكان</th>
                <th className="px-4 py-4 text-right text-xs font-black text-brown uppercase">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((car, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-beige/5 transition-colors group">
                  <td className="px-4 py-4 text-sm text-gray-500 font-bold">{idx + 1}</td>
                  <td className="px-4 py-4 text-sm font-black text-brown">{car.car}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{car.variant}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{car.modelYear}</td>
                  <td className="px-4 py-4 text-sm font-mono text-beige font-bold">{car.vin}</td>
                  <td className="px-4 py-4">
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black">{car.location}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400 truncate max-w-[200px]">{car.notes || '—'}</td>
                </tr>
              ))}
              {filteredStock.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 font-bold">لا توجد بيانات مطابقة للبحث</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
