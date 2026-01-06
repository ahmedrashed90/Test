
import React, { useEffect, useState, useMemo } from 'react';
import { onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Car, Move, UserProfile, UserRole } from '../types';
import { FIXED_LOCATIONS, SOLD_OR_AGENCY_STATES } from '../constants';

interface InventoryProps {
  user: UserProfile;
}

const Inventory: React.FC<InventoryProps> = ({ user }) => {
  const [stock, setStock] = useState<Car[]>([]);
  const [moves, setMoves] = useState<Move[]>([]);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('الكل');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStock(data.stock || []);
        setMoves(data.moves || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredStock = useMemo(() => {
    return stock.filter(car => {
      const matchesSearch = 
        car.vin.toLowerCase().includes(search.toLowerCase()) ||
        car.car.toLowerCase().includes(search.toLowerCase()) ||
        car.variant.toLowerCase().includes(search.toLowerCase());
      
      const matchesLocation = locationFilter === 'الكل' || car.location === locationFilter;
      const isNotHidden = !SOLD_OR_AGENCY_STATES.some(s => car.location.includes(s));

      return matchesSearch && matchesLocation && isNotHidden;
    });
  }, [stock, search, locationFilter]);

  if (loading) return <div className="p-8 text-center text-mzj-beige font-bold">جاري تحميل المخزون...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-mzj-beige/20 shadow-sm">
        <h2 className="text-xl font-black text-mzj-brown mb-4 flex items-center gap-2">
          <i className="fa-solid fa-magnifying-glass text-mzj-beige"></i>
          فلترة المخزون
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <i className="fa-solid fa-search absolute right-4 top-3.5 text-gray-400"></i>
            <input
              type="text"
              placeholder="بحث برقم الهيكل أو الموديل..."
              className="w-full pr-10 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-mzj-beige focus:ring-0 transition-all text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="w-full py-3 px-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-mzj-beige focus:ring-0 transition-all text-sm outline-none font-bold text-mzj-brown"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="الكل">كل الأماكن المتاحة</option>
            {FIXED_LOCATIONS.filter(l => !SOLD_OR_AGENCY_STATES.some(s => l.includes(s))).map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 px-4 py-2 bg-mzj-cream/50 rounded-2xl border border-mzj-beige/10">
            <span className="text-xs font-bold text-gray-500">إجمالي النتائج:</span>
            <span className="text-sm font-black text-mzj-brown">{filteredStock.length} سيارة</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-mzj-beige/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-mzj-cream text-mzj-brown text-xs font-black uppercase tracking-wider">
                <th className="px-6 py-4 border-b border-mzj-beige/20">رقم الهيكل</th>
                <th className="px-6 py-4 border-b border-mzj-beige/20">السيارة</th>
                <th className="px-6 py-4 border-b border-mzj-beige/20">البيان</th>
                <th className="px-6 py-4 border-b border-mzj-beige/20">المكان</th>
                <th className="px-6 py-4 border-b border-mzj-beige/20">الموديل</th>
                <th className="px-6 py-4 border-b border-mzj-beige/20 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStock.map((car) => (
                <tr key={car.id} className="hover:bg-mzj-cream/10 transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono text-mzj-brown font-bold">{car.vin}</td>
                  <td className="px-6 py-4 text-sm font-black text-mzj-brown">{car.car}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{car.variant}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black bg-mzj-cream border border-mzj-beige/30 text-mzj-brown px-2 py-1 rounded-lg">
                      {car.location}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-600">{car.modelYear}</td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-mzj-cream text-mzj-beige rounded-xl transition-colors" title="نقل السيارة">
                        <i className="fa-solid fa-right-left"></i>
                      </button>
                      <button className="p-2 hover:bg-mzj-cream text-mzj-brown rounded-xl transition-colors" title="إضافة ملاحظات">
                        <i className="fa-solid fa-message"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStock.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-300">
              <i className="fa-solid fa-car-side"></i>
            </div>
            <p className="text-gray-400 font-bold">لم يتم العثور على سيارات مطابقة لبحثك</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
