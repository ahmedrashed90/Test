
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Car, Move } from '../types';
import { FIXED_LOCATIONS } from '../constants';

const VehicleTransfer = () => {
  const [stock, setStock] = useState<Car[]>([]);
  const [destination, setDestination] = useState(FIXED_LOCATIONS[0]);
  const [vins, setVins] = useState(['']);
  const [adminNotes, setAdminNotes] = useState('');
  const [financeNotes, setFinanceNotes] = useState('');
  const [adminApproved, setAdminApproved] = useState(false);
  const [financeApproved, setFinanceApproved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) setStock(snap.data().stock || []);
    });
    return () => unsub();
  }, []);

  const handleTransfer = async () => {
    const validVins = vins.filter(v => v.trim() !== '');
    if (validVins.length === 0) return alert('يرجى إدخال رقم هيكل واحد على الأقل');

    setLoading(true);
    try {
      const stateRef = doc(db, 'mzj_admin_state', 'v1');
      const updatedStock = [...stock];
      const newMoves: Move[] = [];

      for (const vin of validVins) {
        const carIndex = updatedStock.findIndex(c => c.vin === vin);
        if (carIndex === -1) {
          alert(`رقم الهيكل ${vin} غير موجود في المخزون`);
          continue;
        }

        const oldLocation = updatedStock[carIndex].location;
        updatedStock[carIndex].location = destination;
        
        // Handling special notes for "Sold under delivery"
        if (destination.includes('مباع تحت التسليم')) {
            updatedStock[carIndex].adminNotes = adminNotes;
            updatedStock[carIndex].financeNotes = financeNotes;
        }

        newMoves.push({
          id: Date.now().toString() + Math.random(),
          vin,
          car: updatedStock[carIndex].car,
          from: oldLocation,
          to: destination,
          date: new Date().toLocaleString('ar-SA'),
          ts: new Date(),
          adminApproved: destination.includes('مباع تحت التسليم') ? adminApproved : undefined,
          financeApproved: destination.includes('مباع تحت التسليم') ? financeApproved : undefined
        });
      }

      await updateDoc(stateRef, {
        stock: updatedStock,
        moves: arrayUnion(...newMoves)
      });

      alert('تم تنفيذ النقل بنجاح');
      setVins(['']);
      setAdminNotes('');
      setFinanceNotes('');
      setAdminApproved(false);
      setFinanceApproved(false);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تنفيذ عملية النقل');
    } finally {
      setLoading(false);
    }
  };

  const isSoldUnderDelivery = destination.includes('مباع تحت التسليم');

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h2 className="text-2xl font-black text-brown">نقل السيارات</h2>
        <p className="text-xs text-gray-400 font-bold mt-1 uppercase">حركة نقل السيارات (برقم الهيكل)</p>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Destination Selection */}
        <div className="space-y-4">
          <label className="text-sm font-black text-brown mr-2 flex items-center gap-2">
            <i className="fa-solid fa-location-dot text-beige"></i>
            الوجهة العامة
          </label>
          <select 
            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brown font-bold text-sm appearance-none cursor-pointer"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            {FIXED_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* VIN Inputs */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-black text-brown mr-2 flex items-center gap-2">
              <i className="fa-solid fa-barcode text-beige"></i>
              أرقام الهيكل (VIN)
            </label>
            <button 
              onClick={() => setVins([...vins, ''])} 
              className="px-4 py-2 text-[10px] font-black text-beige bg-beige/5 rounded-xl border border-beige/10 hover:bg-beige/10 transition-colors"
            >
              <i className="fa-solid fa-plus-circle ml-1"></i> إضافة حركة أخرى
            </button>
          </div>
          <div className="space-y-3">
            {vins.map((vin, i) => (
              <div key={i} className="flex gap-2 group">
                <input 
                  className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brown font-mono font-bold text-sm transition-all focus:ring-4 focus:ring-brown/5"
                  placeholder="أدخل رقم الهيكل VIN المكون من 17 خانة"
                  value={vin}
                  onChange={(e) => {
                    const next = [...vins];
                    next[i] = e.target.value;
                    setVins(next);
                  }}
                />
                {vins.length > 1 && (
                  <button 
                    onClick={() => setVins(vins.filter((_, idx) => idx !== i))} 
                    className="w-14 h-14 bg-red-50 text-red-300 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Special Requirements for Sold Status */}
        {isSoldUnderDelivery && (
          <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 space-y-6 animate-in slide-in-from-top duration-500 shadow-inner">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation text-amber-500"></i>
              <h3 className="text-sm font-black text-amber-700">المتطلبات عند النقل إلى مباع تحت التسليم</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={adminApproved} 
                    onChange={e => setAdminApproved(e.target.checked)} 
                    className="w-6 h-6 rounded-lg border-amber-300 text-amber-600 focus:ring-amber-500" 
                  />
                  <span className="text-xs font-black text-amber-800 group-hover:text-amber-900 transition-colors">موافقة إدارية</span>
                </label>
                <textarea 
                  className="w-full h-24 p-4 bg-white border border-amber-100 rounded-2xl text-xs font-bold outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10"
                  placeholder="اكتب ملاحظات الموافقة الإدارية هنا..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                />
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={financeApproved} 
                    onChange={e => setFinanceApproved(e.target.checked)} 
                    className="w-6 h-6 rounded-lg border-amber-300 text-amber-600 focus:ring-amber-500" 
                  />
                  <span className="text-xs font-black text-amber-800 group-hover:text-amber-900 transition-colors">موافقة مالية</span>
                </label>
                <textarea 
                  className="w-full h-24 p-4 bg-white border border-amber-100 rounded-2xl text-xs font-bold outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10"
                  placeholder="اكتب ملاحظات الموافقة المالية هنا..."
                  value={financeNotes}
                  onChange={e => setFinanceNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-6 border-t border-gray-100">
          <button 
            onClick={handleTransfer} 
            disabled={loading}
            className="w-full bg-brown text-white py-5 rounded-2xl font-black shadow-xl shadow-brown/20 hover:bg-brown-dark hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <i className="fa-solid fa-circle-notch fa-spin"></i>
            ) : (
              <i className="fa-solid fa-paper-plane"></i>
            )}
            تأفيذ عملية النقل
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleTransfer;
