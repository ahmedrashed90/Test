
import React, { useEffect, useState, useMemo } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Car, UserProfile } from '../types';

interface SalesProps {
  user: UserProfile;
}

const Sales: React.FC<SalesProps> = ({ user }) => {
  const [stock, setStock] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) setStock(snap.data().stock || []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const soldCars = useMemo(() => {
    return stock.filter(c => 
      (c.location.includes('مباع') || c.notes.includes('مباع')) &&
      c.vin.toLowerCase().includes(search.toLowerCase())
    );
  }, [stock, search]);

  if (loading) return <div className="p-8 text-center text-mzj-beige font-bold">جاري تحميل سجلات المبيعات...</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-mzj-brown">إدارة المبيعات</h2>
          <p className="text-sm text-gray-500">متابعة السيارات المحجوزة والمباعة تحت التسليم</p>
        </div>
        <input 
          type="text" 
          placeholder="بحث برقم الهيكل..." 
          className="px-4 py-2 rounded-xl bg-white border border-mzj-beige/30 outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {soldCars.map(car => (
          <div key={car.id} className="bg-white p-5 rounded-3xl border border-mzj-beige/20 shadow-sm space-y-3">
             <div className="flex justify-between items-start">
                <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">
                   {car.location.includes('تحت التسليم') ? 'تحت التسليم' : 'تم التسليم'}
                </span>
                <span className="text-xs font-mono font-bold text-gray-400">{car.vin}</span>
             </div>
             <div>
                <h3 className="font-black text-mzj-brown">{car.car}</h3>
                <p className="text-xs text-gray-500">{car.variant}</p>
             </div>
             <div className="pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                <i className="fa-solid fa-location-dot ml-1"></i> {car.location}
             </div>
          </div>
        ))}
      </div>

      {soldCars.length === 0 && (
        <div className="p-20 text-center text-gray-400">
           <i className="fa-solid fa-receipt text-4xl mb-3 opacity-20"></i>
           <p className="font-bold">لا توجد سيارات مباعة مطابقة للبحث</p>
        </div>
      )}
    </div>
  );
};

export default Sales;
