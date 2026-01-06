
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Car } from '../types';
import { FIXED_LOCATIONS } from '../constants';
// Add XLSX import for excel export functionality
import * as XLSX from 'xlsx';

const Inventory = () => {
  const [stock, setStock] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [dealerFilter, setDealerFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) setStock(snap.data().stock || []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredStock = stock.filter(car => {
    const q = search.toLowerCase();
    return (
      (car.vin?.toLowerCase().includes(q) || car.car?.toLowerCase().includes(q) || car.variant?.toLowerCase().includes(q)) &&
      (!modelFilter || car.car === modelFilter) &&
      (!yearFilter || car.modelYear === yearFilter) &&
      (!dealerFilter || car.dealer === dealerFilter) &&
      (!locationFilter || car.location === locationFilter)
    );
  });

  const handleExportExcel = () => {
    // Fixed: Using XLSX from imported library
    const ws = XLSX.utils.json_to_sheet(filteredStock);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "MZJ_Inventory_Export.xlsx");
  };

  const uniqueModels = Array.from(new Set(stock.map(c => c.car)));
  const uniqueYears = Array.from(new Set(stock.map(c => c.modelYear)));
  const uniqueDealers = Array.from(new Set(stock.map(c => c.dealer)));

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-brown flex items-center gap-3">
              <i className="fa-solid fa-boxes-stacked text-beige"></i>
              جدول السيارات والمخزون
            </h2>
            <div className="flex gap-4 text-xs font-black text-gray-400 uppercase tracking-widest">
               <span>إجمالي: {filteredStock.length} سيارة</span>
               <span>عدد الأماكن: {Array.from(new Set(filteredStock.map(c=>c.location))).length}</span>
            </div>
          </div>
          <button 
            onClick={handleExportExcel}
            className="bg-brown text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-brown/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <i className="fa-solid fa-file-excel text-lg"></i>
            تصدير المخزون (Excel)
          </button>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-50">
           <div className="relative">
              <i className="fa-solid fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
              <input className="w-full pr-11 pl-4 py-4 bg-white border border-gray-100 rounded-xl outline-none focus:border-brown font-bold text-xs" placeholder="بحث عام (VIN / سيارة)" value={search} onChange={e=>setSearch(e.target.value)} />
           </div>
           <select className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none focus:border-brown font-bold text-xs appearance-none" value={modelFilter} onChange={e=>setModelFilter(e.target.value)}>
              <option value="">كل الموديلات</option>
              {uniqueModels.map(m => <option key={m} value={m}>{m}</option>)}
           </select>
           <select className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none focus:border-brown font-bold text-xs appearance-none" value={yearFilter} onChange={e=>setYearFilter(e.target.value)}>
              <option value="">كل السنوات</option>
              {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
           </select>
           <select className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none focus:border-brown font-bold text-xs appearance-none" value={dealerFilter} onChange={e=>setDealerFilter(e.target.value)}>
              <option value="">كل الوكلاء</option>
              {uniqueDealers.map(d => <option key={d} value={d}>{d}</option>)}
           </select>
           <select className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none focus:border-brown font-bold text-xs appearance-none" value={locationFilter} onChange={e=>setLocationFilter(e.target.value)}>
              <option value="">كل الأماكن</option>
              {FIXED_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
           </select>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-gray-100 shadow-inner">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="bg-gray-50 text-gray-400 border-b border-gray-100">
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">#</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">السيارة والفئة</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">رقم الهيكل (VIN)</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">اللون (خ/د)</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">المكان الحالي</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">الوكيل / الدفعة</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center font-black text-gray-300 animate-pulse">جاري تحميل قاعدة البيانات...</td></tr>
              ) : filteredStock.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-gray-400 font-bold">لا توجد نتائج مطابقة للفلاتر المختارة</td></tr>
              ) : filteredStock.map((car, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-beige/5 transition-all group">
                  <td className="px-6 py-5 text-gray-300 font-black">{idx + 1}</td>
                  <td className="px-6 py-5">
                    <p className="font-black text-brown">{car.car}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{car.variant} - {car.modelYear}</p>
                  </td>
                  <td className="px-6 py-5 font-mono font-bold text-beige text-xs tracking-wider">{car.vin}</td>
                  <td className="px-6 py-5 text-gray-600 font-bold text-[11px]">{car.extColor} / {car.intColor}</td>
                  <td className="px-6 py-5">
                    <span className="px-4 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-black group-hover:bg-white group-hover:border-beige/30 transition-all">{car.location}</span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[10px] font-bold text-gray-500">{car.dealer || '—'}</p>
                    <p className="text-[9px] font-black text-beige uppercase tracking-tighter">{car.batchName || '—'}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Inventory;
