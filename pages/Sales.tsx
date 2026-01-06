
import React, { useState, useEffect } from 'react';
import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { trackingDb } from '../services/firebase';
import { SALES_STAGES } from '../constants';

const Sales = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(trackingDb, 'erp_orders'), orderBy('updatedAt', 'desc'), limit(100)), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const openOrder = (oId: string) => {
    const o = orders.find(o => String(o.orderNo) === String(oId) || o.vin === oId);
    if (o) setSelectedOrder(o);
    else alert('الطلب غير موجود في النظام');
  };

  const filteredOrders = orders.filter(o => 
    String(o.orderNo).includes(orderSearch) || 
    o.customerName?.includes(orderSearch) || 
    o.vin?.includes(orderSearch)
  );

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
      <div className="bg-gray-50/50 p-2 border-b border-gray-100 flex gap-1">
        <button onClick={() => {setActiveTab('search'); setSelectedOrder(null);}} className={`px-10 py-4 rounded-2xl font-black text-xs transition-all ${activeTab === 'search' ? 'bg-brown text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}>بحث عن طلب</button>
        <button onClick={() => setActiveTab('all')} className={`px-10 py-4 rounded-2xl font-black text-xs transition-all ${activeTab === 'all' ? 'bg-brown text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}>كل الطلبات</button>
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        {activeTab === 'search' && !selectedOrder && (
          <div className="max-w-xl mx-auto py-20 space-y-10 text-center animate-in fade-in slide-in-from-bottom duration-500">
            <div className="space-y-4">
               <h2 className="text-3xl font-black text-brown">متابعة إجراءات طلبات البيع</h2>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-loose">اكتب رقم الطلب المكون من 6 أرقام أو رقم الهيكل VIN ثم اضغط "فتح الطلب" لمشاهدة المراحل والتواصل مع العميل</p>
            </div>
            
            <div className="space-y-6">
              <input 
                className="w-full px-10 py-8 bg-gray-50 border border-gray-100 rounded-[3rem] text-center text-4xl font-black text-brown outline-none focus:ring-8 focus:ring-brown/5 focus:bg-white transition-all shadow-inner" 
                placeholder="000000" 
                value={search} 
                onChange={e=>setSearch(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && openOrder(search)}
              />
              <div className="flex gap-4">
                <button onClick={()=>openOrder(search)} className="flex-1 bg-brown text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-brown/30 hover:scale-105 active:scale-95 transition-all">فتح بيانات الطلب</button>
                <button onClick={()=>setSearch('')} className="px-12 py-6 bg-gray-100 text-gray-400 rounded-[2rem] font-black">تفريغ</button>
              </div>
            </div>
          </div>
        )}

        {selectedOrder && (
          <div className="max-w-5xl mx-auto space-y-10 animate-in zoom-in duration-500">
            <div className="p-10 bg-brown text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-4xl font-black tracking-tight">طلب رقم #{selectedOrder.orderNo}</h3>
                  <p className="mt-2 font-bold text-white/60 flex items-center gap-2"><i className="fa-solid fa-user-circle"></i> العميل: {selectedOrder.customerName}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase bg-white/10 px-4 py-2 rounded-full tracking-widest">المرحلة الحالية</span>
                  <p className="text-2xl font-black mt-2 text-beige">{selectedOrder.doneCount}/10 مكتملة</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-black text-brown text-lg flex items-center gap-3"><i className="fa-solid fa-list-check text-beige"></i> قائمة مراحل التنفيذ</h4>
                  <div className="space-y-3">
                    {SALES_STAGES.map((stage, idx) => (
                      <div key={idx} className={`group flex items-center gap-5 p-6 rounded-[2rem] border transition-all duration-300 ${idx < selectedOrder.doneCount ? 'bg-green-50/50 border-green-100' : 'bg-gray-50/50 border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-brown/5'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${idx < selectedOrder.doneCount ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-gray-300 border border-gray-100'}`}>{idx + 1}</div>
                        <div className="flex-1 min-w-0">
                           <span className={`font-black text-sm block ${idx < selectedOrder.doneCount ? 'text-green-700' : 'text-gray-400'}`}>{stage}</span>
                           <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">{idx < 5 ? 'إجراء عميل' : 'إجراء معرض'}</span>
                        </div>
                        <button className="w-12 h-12 bg-white border border-gray-100 rounded-2xl text-brown hover:bg-brown hover:text-white hover:scale-110 transition-all flex items-center justify-center shadow-sm">
                           <i className="fa-brands fa-whatsapp text-xl"></i>
                        </button>
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 sticky top-4">
                     <h4 className="font-black text-brown mb-6 flex items-center gap-2"><i className="fa-solid fa-info-circle text-beige"></i> بيانات إضافية</h4>
                     <div className="space-y-6">
                        <div><p className="text-[9px] font-black text-gray-400 mb-1 uppercase">رقم الجوال</p><p className="font-black text-brown">{selectedOrder.phone || 'غير مسجل'}</p></div>
                        <div><p className="text-[9px] font-black text-gray-400 mb-1 uppercase">الفرع</p><p className="font-black text-brown">{selectedOrder.branch || 'الفرع الرئيسي'}</p></div>
                        <div><p className="text-[9px] font-black text-gray-400 mb-1 uppercase">رقم الهيكل VIN</p><p className="font-mono font-bold text-beige">{selectedOrder.vin}</p></div>
                        <div><p className="text-[9px] font-black text-gray-400 mb-1 uppercase">البائع</p><p className="font-black text-brown">{selectedOrder.sellerName || '—'}</p></div>
                     </div>
                     <button onClick={()=>setSelectedOrder(null)} className="w-full mt-10 py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-xs hover:text-brown hover:border-brown transition-all">الرجوع للبحث</button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'all' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
               <h2 className="text-xl font-black text-brown">قائمة كافة الطلبات</h2>
               <div className="relative w-full sm:w-80">
                  <i className="fa-solid fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input className="w-full pr-11 pl-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-brown font-bold text-sm" placeholder="بحث برقم الطلب، العميل..." value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} />
               </div>
            </div>
            <div className="overflow-x-auto rounded-[2.5rem] border border-gray-100">
              <table className="w-full text-sm text-right">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400"><th className="px-6 py-5">رقم الطلب</th><th className="px-6 py-5">اسم العميل</th><th className="px-6 py-5">الجوال</th><th className="px-6 py-5">الحالة</th><th className="px-6 py-5 text-center">إجراء</th></tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? <tr><td colSpan={5} className="py-20 text-center text-gray-300 font-bold font-black text-2xl">لا توجد طلبات مطابقة</td></tr> : filteredOrders.map(o => (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-beige/5 transition-all group">
                      <td className="px-6 py-5 font-black text-brown">{o.orderNo}</td>
                      <td className="px-6 py-5 font-bold text-gray-700">{o.customerName}</td>
                      <td className="px-6 py-5 font-mono text-gray-400">{o.phone}</td>
                      <td className="px-6 py-5"><span className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${o.doneCount >= 10 ? 'bg-green-100 text-green-700' : o.doneCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{o.doneCount >= 10 ? 'مكتمل' : o.doneCount > 0 ? 'تحت المتابعة' : 'لم يبدأ'}</span></td>
                      <td className="px-6 py-5 text-center"><button onClick={()=>{setSelectedOrder(o); setActiveTab('search');}} className="w-10 h-10 bg-brown text-white rounded-xl shadow-lg hover:scale-110 transition-all"><i className="fa-solid fa-eye text-sm"></i></button></td>
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
