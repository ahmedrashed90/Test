
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { db, trackingDb } from '../services/firebase';
import { Car, PhotoshootRequest } from '../types';
import { GROUPS, isSoldRow, isActualRow, isAgency, isLiveStock } from '../constants';

const Dashboard = () => {
  const [stock, setStock] = useState<Car[]>([]);
  const [requests, setRequests] = useState<PhotoshootRequest[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ title: string, data: any[], type: 'stock' | 'shortage' | 'request' | 'sales' } | null>(null);

  useEffect(() => {
    const unsubStock = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) setStock(snap.data().stock || []);
    });
    const unsubReq = onSnapshot(query(collection(db, 'requests'), orderBy('createdAt', 'desc'), limit(50)), (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as PhotoshootRequest)));
    });
    const unsubSales = onSnapshot(query(collection(trackingDb, 'erp_orders'), limit(100)), (snap) => {
      setSalesOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    setLoading(false);
    return () => { unsubStock(); unsubReq(); unsubSales(); };
  }, []);

  const calculateShortages = () => {
    const comboMap: Record<string, Record<string, number>> = {};
    const refStock = stock.filter(r => isActualRow(r.location));
    refStock.forEach(car => {
      const key = `${car.car}|${car.variant}|${car.intColor}|${car.extColor}|${car.modelYear}`;
      if (!comboMap[key]) comboMap[key] = { total: 0, BR1: 0, BR2: 0, BR3: 0 };
      comboMap[key].total++;
      if (car.location.includes('فرع 1')) comboMap[key].BR1++;
      if (car.location.includes('فرع 2')) comboMap[key].BR2++;
      if (car.location.includes('فرع 3')) comboMap[key].BR3++;
    });
    const list: any[] = [];
    Object.entries(comboMap).forEach(([key, counts]) => {
      if (counts.total > 0) {
        if (counts.BR1 === 0 || counts.BR2 === 0 || counts.BR3 === 0) list.push({ key, ...counts });
      }
    });
    return list;
  };

  const photoShortages = stock.filter(car => car.location.includes('سيارات بها ملاحظات') && !requests.some(req => req.vins.includes(car.vin) && req.status !== 'منتهي'));

  const openModal = (title: string, data: any[], type: any) => setModal({ title, data, type });

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* كارت النواقص */}
        <div onClick={() => openModal('النواقص - الفروع', calculateShortages(), 'shortage')} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm cursor-pointer hover:shadow-xl transition-all">
          <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-widest">النواقص — الفروع فقط</h3>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-black text-red-500">{calculateShortages().length}</span>
            <div className="flex gap-1">
              <span className="px-2 py-1 bg-red-50 text-red-600 text-[9px] font-black rounded-lg">فرع 1</span>
              <span className="px-2 py-1 bg-red-50 text-red-600 text-[9px] font-black rounded-lg">فرع 2</span>
              <span className="px-2 py-1 bg-red-50 text-red-600 text-[9px] font-black rounded-lg">فرع 3</span>
            </div>
          </div>
        </div>

        {/* كارت نواقص التصوير */}
        <div onClick={() => openModal('نواقص التصوير', photoShortages, 'stock')} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm cursor-pointer hover:shadow-xl transition-all">
          <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-widest">نواقص التصوير</h3>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-black text-orange-500">{photoShortages.length}</span>
            <i className="fa-solid fa-camera-rotate text-orange-100 text-3xl"></i>
          </div>
        </div>

        {/* كارت المخزون الحي */}
        <div onClick={() => openModal('المخزون الحي', stock.filter(r => isLiveStock(r.location)), 'stock')} className="lg:col-span-2 bg-brown text-white p-8 rounded-[2.5rem] shadow-xl shadow-brown/20 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-all">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-black text-white/60 text-xs uppercase tracking-widest">إجمالي المخزون الحي</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black">الوكالة: {stock.filter(r => isAgency(r.location) && isLiveStock(r.location)).length}</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black">المتاح: {stock.filter(r => isLiveStock(r.location) && !isAgency(r.location)).length}</span>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-5xl font-black">{stock.filter(r => isLiveStock(r.location)).length}</span>
              <div className="text-left">
                <p className="text-[10px] font-black text-white/40 mb-1">بها ملاحظات</p>
                <span className="text-xl font-black text-beige">{stock.filter(r => (r.notes || r.adminNotes) || r.location.includes('ملاحظات')).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* تتبع طلبات البيع */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm col-span-1 lg:col-span-1">
          <h3 className="text-xs font-black text-gray-400 mb-6 uppercase tracking-widest">تتبع طلبات البيع</h3>
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => openModal('طلبات لم تبدأ', salesOrders.filter(o => o.doneCount === 0), 'sales')} className="p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
              <p className="text-[9px] font-black text-gray-400 mb-1">لم تبدأ</p>
              <p className="text-xl font-black text-brown">{salesOrders.filter(o => o.doneCount === 0).length}</p>
            </div>
            <div onClick={() => openModal('طلبات تحت المتابعة', salesOrders.filter(o => o.doneCount > 0 && o.doneCount < 10), 'sales')} className="p-4 bg-beige/5 rounded-2xl cursor-pointer hover:bg-beige/10 transition-all">
              <p className="text-[9px] font-black text-beige mb-1">تحت المتابعة</p>
              <p className="text-xl font-black text-brown">{salesOrders.filter(o => o.doneCount > 0 && o.doneCount < 10).length}</p>
            </div>
          </div>
        </div>

        {/* طلبات النقل والتصوير */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
           <h3 className="text-xs font-black text-gray-400 mb-6 uppercase tracking-widest">إحصائيات العمليات (تصوير/نقل)</h3>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div onClick={() => openModal('طلبات جارية', requests.filter(r => r.status !== 'منتهي'), 'request')} className="p-4 bg-blue-50 rounded-2xl cursor-pointer">
                <p className="text-[9px] font-black text-blue-400 mb-1">جارية</p>
                <p className="text-xl font-black text-blue-600">{requests.filter(r => r.status !== 'منتهي').length}</p>
              </div>
              <div onClick={() => openModal('طلبات مكتملة', requests.filter(r => r.status === 'منتهي'), 'request')} className="p-4 bg-green-50 rounded-2xl cursor-pointer">
                <p className="text-[9px] font-black text-green-400 mb-1">مكتملة</p>
                <p className="text-xl font-black text-green-600">{requests.filter(r => r.status === 'منتهي').length}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {GROUPS.map(group => {
          const members = stock.filter(r => group.members.includes(r.location));
          return (
            <div key={group.key} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-beige/5 rounded-2xl flex items-center justify-center text-brown text-xl"><i className={`fa-solid ${group.icon}`}></i></div>
                    <h3 className="font-black text-brown">{group.title}</h3>
                  </div>
                  <span className="text-2xl font-black text-brown">{members.filter(r => isActualRow(r.location)).length}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => openModal(`${group.title} - متاح`, members.filter(r => r.location.endsWith('المخزون المتاح')), 'stock')} className="p-3 bg-gray-50 rounded-xl text-[10px] font-black text-gray-500 hover:bg-beige/10 hover:text-brown transition-all">متاح ({members.filter(r => r.location.endsWith('المخزون المتاح')).length})</button>
                  <button onClick={() => openModal(`${group.title} - ملاحظات`, members.filter(r => r.location.includes('سيارات بها ملاحظات')), 'stock')} className="p-3 bg-gray-50 rounded-xl text-[10px] font-black text-gray-500 hover:bg-beige/10 hover:text-brown transition-all">ملاحظات ({members.filter(r => r.location.includes('سيارات بها ملاحظات')).length})</button>
                  <button onClick={() => openModal(`${group.title} - تحت التسليم`, members.filter(r => r.location.includes('تحت التسليم')), 'stock')} className="p-3 bg-gray-50 rounded-xl text-[10px] font-black text-gray-500 hover:bg-beige/10 hover:text-brown transition-all">تحت التسليم ({members.filter(r => r.location.includes('تحت التسليم')).length})</button>
                  <button onClick={() => openModal(`${group.title} - تم التسليم`, members.filter(r => r.location.includes('تم التسليم')), 'stock')} className="p-3 bg-gray-50 rounded-xl text-[10px] font-black text-gray-500 hover:bg-beige/10 hover:text-brown transition-all">تم التسليم ({members.filter(r => r.location.includes('تم التسليم')).length})</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal View */}
      {modal && (
        <div className="fixed inset-0 bg-brown/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 bg-brown text-white flex justify-between items-center">
              <h3 className="text-xl font-black">{modal.title} ({modal.data.length})</h3>
              <button onClick={() => setModal(null)} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-sm text-right">
                <thead className="sticky top-0 bg-white border-b-2 border-gray-100">
                  <tr className="text-gray-400">
                    {modal.type === 'stock' && <><th className="p-4">السيارة</th><th className="p-4">الفئة</th><th className="p-4 font-mono">VIN</th><th className="p-4">المكان</th></>}
                    {modal.type === 'shortage' && <><th className="p-4">المواصفات</th><th className="p-4 text-center">الإجمالي</th><th className="p-4 text-center">ف1</th><th className="p-4 text-center">ف2</th><th className="p-4 text-center">ف3</th></>}
                    {modal.type === 'sales' && <><th className="p-4">رقم الطلب</th><th className="p-4">العميل</th><th className="p-4">المراحل</th><th className="p-4 font-mono">VIN</th></>}
                  </tr>
                </thead>
                <tbody>
                  {modal.data.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                      {modal.type === 'stock' && <><td className="p-4 font-black text-brown">{item.car}</td><td className="p-4 font-bold text-gray-600">{item.variant}</td><td className="p-4 font-mono font-bold text-beige">{item.vin}</td><td className="p-4 text-xs">{item.location}</td></>}
                      {modal.type === 'shortage' && <><td className="p-4 font-bold text-gray-700">{item.key.replace(/\|/g, ' - ')}</td><td className="p-4 text-center font-black">{item.total}</td><td className={`p-4 text-center ${item.BR1 === 0 ? 'text-red-500 font-black' : 'text-gray-400'}`}>{item.BR1}</td><td className={`p-4 text-center ${item.BR2 === 0 ? 'text-red-500 font-black' : 'text-gray-400'}`}>{item.BR2}</td><td className={`p-4 text-center ${item.BR3 === 0 ? 'text-red-500 font-black' : 'text-gray-400'}`}>{item.BR3}</td></>}
                      {modal.type === 'sales' && <><td className="p-4 font-black text-brown">{item.orderNo}</td><td className="p-4 font-bold text-gray-700">{item.customerName}</td><td className="p-4 text-center"><span className="px-3 py-1 bg-beige/10 rounded-lg text-brown font-black">{item.doneCount}/10</span></td><td className="p-4 font-mono text-beige">{item.vin}</td></>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
