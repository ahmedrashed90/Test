
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Car, Move } from '../types';
import { FIXED_LOCATIONS } from '../constants';
// Add XLSX import for template export functionality
import * as XLSX from 'xlsx';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [stock, setStock] = useState<Car[]>([]);
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newCar, setNewCar] = useState({ 
    car: '', variant: '', vin: '', modelYear: '2025', location: FIXED_LOCATIONS[0], 
    dealer: '', extColor: '', intColor: '', plate: '', batchName: '', notes: '' 
  });

  // Tracking/Edit state
  const [searchVin, setSearchVin] = useState('');
  const [foundCar, setFoundCar] = useState<Car | null>(null);

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
    if (!newCar.car || !newCar.vin) return alert('أكمل البيانات الأساسية');
    const car = { ...newCar, id: Date.now() };
    await updateDoc(doc(db, 'mzj_admin_state', 'v1'), { stock: arrayUnion(car) });
    alert('تمت إضافة السيارة بنجاح');
    setNewCar({ car:'', variant:'', vin:'', modelYear:'2025', location:FIXED_LOCATIONS[0], dealer:'', extColor:'', intColor:'', plate:'', batchName:'', notes:'' });
  };

  const handleExportEmpty = () => {
    // Fixed: Using XLSX from imported library
    const ws = XLSX.utils.json_to_sheet([{ car: '', variant: '', dealer: '', extColor: '', intColor: '', modelYear: '', plate: '', location: '', batchName: '', vin: '', notes: '' }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "MZJ_Car_Template.xlsx");
  };

  const tabs = [
    { id: 'add', label: 'إضافة سيارة', icon: 'fa-plus' },
    { id: 'move', label: 'نقل السيارات', icon: 'fa-truck-arrow-right' },
    { id: 'edit', label: 'تعديل السيارات', icon: 'fa-pen-to-square' },
    { id: 'track', label: 'تتبع حركة رقم هيكل', icon: 'fa-magnifying-glass' },
    { id: 'history', label: 'سجل الحركات', icon: 'fa-clock-rotate-left' },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
      <div className="bg-gray-50/50 p-2 border-b border-gray-100 flex flex-wrap gap-1">
        {tabs.map(tab => (
          <button 
            key={tab.id} onClick={() => {setActiveTab(tab.id); setFoundCar(null); setSearchVin('');}}
            className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-brown text-white shadow-md shadow-brown/10' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        {activeTab === 'add' && (
          <form onSubmit={handleAdd} className="max-w-6xl space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100 pb-6">
              <h2 className="text-xl font-black text-brown">نموذج إضافة سيارة جديدة للمخزون</h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleExportEmpty} className="px-4 py-2 bg-beige/10 text-brown font-black text-[10px] rounded-xl border border-beige/20 hover:bg-beige/20 transition-all">تصدير قالب فاضي</button>
                <div className="relative group">
                  <button type="button" className="px-4 py-2 bg-brown text-white font-black text-[10px] rounded-xl shadow-lg hover:bg-brown-dark transition-all flex items-center gap-2">استيراد ▾</button>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl hidden group-hover:block z-50 p-2 space-y-1">
                    <button type="button" className="w-full text-right px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-gray-50 rounded-lg">استبدال كامل</button>
                    <button type="button" className="w-full text-right px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-gray-50 rounded-lg">إضافة فوق الحالي</button>
                    <button type="button" className="w-full text-right px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-gray-50 rounded-lg">تحديث من الشيت</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">اسم السيارة</label>
                <input required className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold" value={newCar.car} onChange={e=>setNewCar({...newCar, car: e.target.value})} placeholder="مثال: لاندكروزر VXR" />
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">الفئة / البيان</label>
                <input required className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold" value={newCar.variant} onChange={e=>setNewCar({...newCar, variant: e.target.value})} placeholder="مثال: فل كامل" />
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">الوكيل</label>
                <input className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold" value={newCar.dealer} onChange={e=>setNewCar({...newCar, dealer: e.target.value})} placeholder="الوكيل" />
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">سنة الموديل</label>
                <input className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold" value={newCar.modelYear} onChange={e=>setNewCar({...newCar, modelYear: e.target.value})} placeholder="2025" />
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">اللون الخارجي</label>
                <input className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold" value={newCar.extColor} onChange={e=>setNewCar({...newCar, extColor: e.target.value})} />
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">اللون الداخلي</label>
                <input className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold" value={newCar.intColor} onChange={e=>setNewCar({...newCar, intColor: e.target.value})} />
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">اللوحة (اختياري)</label>
                <input className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold" value={newCar.plate} onChange={e=>setNewCar({...newCar, plate: e.target.value})} />
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">VIN (رقم الهيكل)</label>
                <input required className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold font-mono" value={newCar.vin} onChange={e=>setNewCar({...newCar, vin: e.target.value})} placeholder="17 خانة" />
              </div>
              <div className="md:col-span-2 space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">المكان</label>
                <select className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold appearance-none" value={newCar.location} onChange={e=>setNewCar({...newCar, location: e.target.value})}>
                  {FIXED_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">اسم الدفعة</label>
                <input className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:border-brown text-sm font-bold" value={newCar.batchName} onChange={e=>setNewCar({...newCar, batchName: e.target.value})} />
              </div>
              <div className="md:col-span-4 space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase mr-2">ملاحظات</label>
                <textarea className="w-full h-32 px-5 py-4 bg-gray-50 border-gray-100 rounded-3xl outline-none focus:border-brown text-sm font-bold" value={newCar.notes} onChange={e=>setNewCar({...newCar, notes: e.target.value})} />
              </div>
            </div>
            <div className="pt-8 border-t border-gray-100 flex gap-4">
              <button type="submit" className="bg-brown text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-brown/20 hover:scale-105 active:scale-95 transition-all">حفظ السيارة في المخزون</button>
              <button type="button" onClick={()=>setNewCar({car:'',variant:'',vin:'',modelYear:'2025',location:FIXED_LOCATIONS[0],dealer:'',extColor:'',intColor:'',plate:'',batchName:'',notes:''})} className="bg-gray-100 text-gray-400 px-12 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all">تفريغ الحقول</button>
            </div>
          </form>
        )}

        {(activeTab === 'move' || activeTab === 'edit' || activeTab === 'track') && (
          <div className="max-w-4xl mx-auto space-y-8 py-10">
             <div className="text-center space-y-4">
                <h2 className="text-2xl font-black text-brown">{activeTab === 'move' ? 'حركة نقل سيارة (برقم الهيكل)' : activeTab === 'edit' ? 'تعديل بيانات سيارة' : 'تتبع حركات رقم هيكل'}</h2>
                <div className="relative max-w-lg mx-auto">
                   <input 
                     className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2.5rem] text-center text-xl font-black outline-none focus:ring-4 focus:ring-brown/5" 
                     placeholder="أدخل رقم الهيكل VIN هنا..." 
                     value={searchVin} 
                     onChange={e => {
                        setSearchVin(e.target.value);
                        const car = stock.find(c => c.vin === e.target.value);
                        if (car) setFoundCar(car);
                        else setFoundCar(null);
                     }}
                   />
                </div>
             </div>

             {foundCar && (
               <div className="p-10 rounded-[3rem] bg-gray-50/50 border border-gray-100 space-y-8 animate-in zoom-in duration-300">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div><p className="text-[10px] font-black text-gray-400 mb-1">السيارة</p><p className="font-black text-brown">{foundCar.car}</p></div>
                    <div><p className="text-[10px] font-black text-gray-400 mb-1">الفئة</p><p className="font-black text-brown">{foundCar.variant}</p></div>
                    <div><p className="text-[10px] font-black text-gray-400 mb-1">المكان الحالي</p><p className="font-black text-beige">{foundCar.location}</p></div>
                    <div><p className="text-[10px] font-black text-gray-400 mb-1">الموديل</p><p className="font-black text-brown">{foundCar.modelYear}</p></div>
                  </div>

                  {activeTab === 'move' && (
                    <div className="pt-8 border-t border-gray-100 space-y-6">
                       <h3 className="text-sm font-black text-brown">تحديد الوجهة الجديدة:</h3>
                       <select className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:border-brown font-bold text-sm">
                         {FIXED_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                       </select>
                       <button className="w-full bg-brown text-white py-4 rounded-2xl font-black shadow-xl">تأكيد النقل</button>
                    </div>
                  )}

                  {activeTab === 'edit' && (
                    <div className="pt-8 border-t border-gray-100 flex gap-4">
                      <button className="flex-1 bg-brown text-white py-4 rounded-2xl font-black shadow-lg">حفظ التعديلات</button>
                      <button className="flex-1 bg-red-50 text-red-500 py-4 rounded-2xl font-black border border-red-100 hover:bg-red-500 hover:text-white transition-all">مسح السيارة نهائياً</button>
                    </div>
                  )}

                  {activeTab === 'track' && (
                    <div className="pt-8 border-t border-gray-100 space-y-4">
                       <h3 className="text-sm font-black text-brown">سجل حركات رقم الهيكل:</h3>
                       {moves.filter(m => m.vin === foundCar.vin).length === 0 ? <p className="text-center py-10 text-gray-300 font-bold">لا يوجد سجل حركات لهذا الرقم</p> : (
                         <div className="space-y-3">
                           {moves.filter(m => m.vin === foundCar.vin).map((m, i) => (
                             <div key={i} className="p-4 bg-white rounded-2xl flex justify-between items-center text-xs border border-gray-50">
                               <span className="font-bold text-brown">{m.from} ← {m.to}</span>
                               <span className="text-gray-400 font-mono">{m.date}</span>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  )}
               </div>
             )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-black text-brown">سجل حركات النظام</h2>
               <div className="flex gap-2">
                 <button className="px-6 py-3 bg-gray-50 text-gray-400 rounded-xl font-black text-[10px]">تصفية</button>
                 <button className="px-6 py-3 bg-brown text-white rounded-xl font-black text-[10px] shadow-lg">تصدير Excel</button>
               </div>
            </div>
            <div className="overflow-x-auto rounded-[2rem] border border-gray-100">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50/50 border-b border-gray-50 text-gray-400">
                  <tr><th className="p-4">رقم الهيكل</th><th className="p-4">السيارة</th><th className="p-4">من</th><th className="p-4">إلى</th><th className="p-4">التاريخ</th></tr>
                </thead>
                <tbody>
                  {moves.slice().reverse().map((m, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                      <td className="p-4 font-mono font-bold text-beige">{m.vin}</td>
                      <td className="p-4 font-black text-brown">{m.car}</td>
                      <td className="p-4 text-xs">{m.from}</td>
                      <td className="p-4 text-xs font-bold text-brown">{m.to}</td>
                      <td className="p-4 text-[10px] text-gray-400 font-bold">{m.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Admin;
