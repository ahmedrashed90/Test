
import React, { useState, useEffect } from 'react';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { trackingDb } from '../services/firebase';
import { SALES_STAGES } from '../constants';

const Sales = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(trackingDb, 'erp_orders'), limit(100)), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const openOrder = (oId: string) => {
    const o = orders.find(o => o.orderNo === oId || o.vin === oId);
    if (o) setSelectedOrder(o);
    else alert('الطلب غير موجود');
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
      <div className="bg-gray-50/50 p-2 border-b border-gray-100 flex gap-1">
        <button onClick={() => {setActiveTab('search'); setSelectedOrder(null);}} className={`px-8 py-3 rounded-2xl font-black text-xs transition-all ${activeTab === 'search' ? 'bg-brown text-white' : 'text-gray-400'}`}>بحث عن طلب</button>
        <button onClick={() => setActiveTab('all')} className={`px-8 py-3 rounded-2xl font-black text-xs transition-all ${activeTab === 'all' ? 'bg-brown text-white' : 'text-gray-400'}`}>كل الطلبات</button>
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        {activeTab === 'search' && !selectedOrder && (
          <div className="max-w-md mx-auto py-10 space-y-6 text-center">
            <h2 className="text-2xl font-black text-brown">متابعة طلب بيع</h2>
            <p className="text-xs text-gray-400 font-bold">اكتب رقم الطلب ثم اضغط فتح الطلب</p>
            <input className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-center text-xl font-black outline-none focus:border-brown" placeholder="رقم الطلب أو VIN" value={search} onChange={e=>setSearch(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={()=>openOrder(search)} className="flex-1 bg-brown text-white py-4 rounded-2xl font-black shadow-lg">فتح الطلب</button>
              <button onClick={()=>setSearch('')} className="px-10 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black">تفريغ</button>
            </div>
          </div>
        )}

        {selectedOrder && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="p-8 bg-brown text-white rounded-[2.5rem] shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black">#{selectedOrder.orderNo}</h3>
                  <p className="mt-2 font-bold text-white/60">العميل: {selectedOrder.customerName}</p>
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded-full">الحالة</span>
                  <p className="text-xl font-black mt-1">{selectedOrder.doneCount >= 10 ? 'مكتمل' : 'تحت المتابعة'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-brown text-lg">مراحل التنفيذ (10 مراحل)</h4>
              <div className="space-y-3">
                {SALES_STAGES.map((stage, idx) => (
                  <div key={idx} className={`flex items-center gap-4 p-5 rounded-3xl border transition-all ${idx < selectedOrder.doneCount ? 'bg-green-50 border-green-100' : 'bg-gray-50/50 border-gray-100'}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${idx < selectedOrder.doneCount ? 'bg-green-500 text-white' : 'bg-white text-gray-300'}`}>{idx + 1}</div>
                    <span className={`font-bold text-sm flex-1 ${idx < selectedOrder.doneCount ? 'text-green-700' : 'text-gray-400'}`}>{stage}</span>
                    <button className="w-10 h-10 bg-white border border-gray-100 rounded-xl text-brown hover:bg-brown hover:text-white transition-all"><i className="fa-brands fa-whatsapp"></i></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'all' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400"><th className="px-4 py-4 text-right">رقم الطلب</th><th className="px-4 py-4 text-right">العميل</th><th className="px-4 py-4 text-right">الحالة</th><th className="px-4 py-4 text-center">إجراء</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                      <td className="px-4 py-4 font-black text-brown">{o.orderNo}</td>
                      <td className="px-4 py-4 font-bold text-gray-700">{o.customerName}</td>
                      <td className="px-4 py-4"><span className={`px-3 py-1 rounded-lg text-[10px] font-black ${o.doneCount >= 10 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{o.doneCount >= 10 ? 'مكتمل' : 'تحت المتابعة'}</span></td>
                      <td className="px-4 py-4 text-center"><button onClick={()=>{setSelectedOrder(o); setActiveTab('search');}} className="w-8 h-8 bg-brown text-white rounded-lg"><i className="fa-solid fa-eye text-[10px]"></i></button></td>
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
export default Sales;
