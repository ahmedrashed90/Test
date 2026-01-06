
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Car, Move } from '../types';
import { FIXED_LOCATIONS } from '../constants';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [stock, setStock] = useState<Car[]>([]);
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newCar, setNewCar] = useState({ car: '', variant: '', vin: '', modelYear: '2025', location: FIXED_LOCATIONS[0], dealer: '', extColor: '', intColor: '', batchName: '', notes: '' });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) {
        setStock(snap.data().stock || []);
        setMoves(snap.data().moves || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCar.car || !newCar.vin) return alert('أكمل البيانات');
    const car = { ...newCar, id: Date.now() };
    await updateDoc(doc(db, 'mzj_admin_state', 'v1'), { stock: arrayUnion(car) });
    alert('تمت الإضافة');
  };

  const tabs = [
    { id: 'add', label: 'إضافة سيارة', icon: 'fa-plus' },
    { id: 'move', label: 'نقل السيارات', icon: 'fa-truck-arrow-right' },
    { id: 'edit', label: 'تعديل السيارات', icon: 'fa-pen-to-square' },
    { id: 'track', label: 'تتبع حركة رقم هيكل', icon: 'fa-magnifying-glass' },
    { id: 'history', label: 'سجل الحركات', icon: 'fa-clock-rotate-left' },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
      <div className="bg-gray-50/50 p-2 border-b border-gray-100 flex flex-wrap gap-1">
        {tabs.map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-brown text-white shadow-md shadow-brown/10' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        {activeTab === 'add' && (
          <form onSubmit={handleAdd} className="max-w-4xl space-y-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-brown">إضافة سيارة جديدة للمخزون</h2>
              <div className="flex gap-2">
                <button type="button" className="px-4 py-2 bg-beige/10 text-brown font-black text-[10px] rounded-xl border border-beige/20 hover:bg-beige/20">تصدير قالب فاضي</button>
                <div className="relative group">
                  <button type="button" className="px-4 py-2 bg-brown text-white font-black text-[10px] rounded-xl shadow-lg">استيراد ▾</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">الموديل</label>
                <input required className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold" value={newCar.car} onChange={e=>setNewCar({...newCar, car: e.target.value})} />
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">الفئة</label>
                <input required className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold" value={newCar.variant} onChange={e=>setNewCar({...newCar, variant: e.target.value})} />
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">VIN (رقم الهيكل)</label>
                <input required className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold font-mono" value={newCar.vin} onChange={e=>setNewCar({...newCar, vin: e.target.value})} />
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">المكان</label>
                <select className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold appearance-none" value={newCar.location} onChange={e=>setNewCar({...newCar, location: e.target.value})}>
                  {FIXED_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">سنة الموديل</label>
                <input className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold" value={newCar.modelYear} onChange={e=>setNewCar({...newCar, modelYear: e.target.value})} />
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">الوكيل</label>
                <input className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold" value={newCar.dealer} onChange={e=>setNewCar({...newCar, dealer: e.target.value})} />
              </div>
            </div>
            <div className="pt-6 border-t border-gray-100 flex gap-4">
              <button type="submit" className="bg-brown text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-brown/20 hover:scale-105 transition-all">حفظ السيارة</button>
              <button type="button" onClick={()=>setNewCar({car:'',variant:'',vin:'',modelYear:'2025',location:FIXED_LOCATIONS[0],dealer:'',extColor:'',intColor:'',batchName:'',notes:''})} className="bg-gray-100 text-gray-400 px-10 py-4 rounded-2xl font-black">تفريغ</button>
            </div>
          </form>
        )}
        {activeTab === 'move' && <div className="p-20 text-center font-bold text-gray-300">نقل السيارات برقم الهيكل (قيد التطوير)</div>}
        {activeTab === 'edit' && <div className="p-20 text-center font-bold text-gray-300">تعديل ومسح سيارة (قيد التطوير)</div>}
        {activeTab === 'track' && <div className="p-20 text-center font-bold text-gray-300">تتبع رقم هيكل (قيد التطوير)</div>}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {moves.slice().reverse().map((m, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-beige">{m.vin}</span>
                <span className="font-bold text-brown">{m.from} ← {m.to}</span>
                <span className="text-gray-400">{m.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Admin;
