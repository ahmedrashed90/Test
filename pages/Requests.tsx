
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { PhotoshootRequest, Car } from '../types';

const Requests = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [requests, setRequests] = useState<PhotoshootRequest[]>([]);
  const [stock, setStock] = useState<Car[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Create form
  const [newRows, setNewRows] = useState<any[]>([]);

  useEffect(() => {
    const unsubReq = onSnapshot(query(collection(db, 'requests'), orderBy('createdAt', 'desc'), limit(100)), (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as PhotoshootRequest)));
    });
    const unsubStock = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) setStock(snap.data().stock || []);
    });
    return () => { unsubReq(); unsubStock(); };
  }, []);

  const findCarByVin = (vin: string) => stock.find(c => c.vin === vin);

  const handleAddRequest = async () => {
    if (newRows.length === 0) return alert('أضف سيارة واحدة على الأقل');
    try {
      const payload = {
        kind: 'mixed',
        status: 'جديد',
        total: newRows.length,
        vins: newRows.map(r => r.vin),
        createdByName: auth.currentUser?.email?.split('@')[0],
        createdByEmail: auth.currentUser?.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rows: newRows.map(r => {
          const car = findCarByVin(r.vin);
          return {
            vin: r.vin,
            type: r.type,
            car: car?.car || 'غير معروف',
            variant: car?.variant || '',
            location: car?.location || '',
            steps: { s1: false, s2: false, s3: false, s4: false }
          };
        })
      };
      await addDoc(collection(db, 'requests'), payload);
      alert('تم إرسال الطلب بنجاح');
      setNewRows([]);
      setActiveTab('manage');
    } catch (err) { alert('فشل إرسال الطلب'); }
  };

  const steps = ["تم استلام الطلب", "تم إرسال السيارة", "تم استلام السيارة", "تم الانتهاء"];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
      <div className="bg-gray-50/50 p-2 border-b border-gray-100 flex gap-1">
        <button onClick={() => setActiveTab('create')} className={`px-10 py-4 rounded-2xl font-black text-xs transition-all ${activeTab === 'create' ? 'bg-brown text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}>إنشاء طلب جديد</button>
        <button onClick={() => setActiveTab('manage')} className={`px-10 py-4 rounded-2xl font-black text-xs transition-all ${activeTab === 'manage' ? 'bg-brown text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}>إدارة الطلبات الجارية</button>
        <button onClick={() => setActiveTab('done')} className={`px-10 py-4 rounded-2xl font-black text-xs transition-all ${activeTab === 'done' ? 'bg-brown text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}>الطلبات المكتملة</button>
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        {activeTab === 'create' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-brown">بناء طلب عمليات جديد</h2>
                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">أدخل رقم الهيكل ليتم جلب بيانات السيارة تلقائياً</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setNewRows([...newRows, {vin:'', type:'shoot'}])} className="px-6 py-3 bg-brown text-white rounded-xl font-black text-xs shadow-xl shadow-brown/20 hover:scale-105 transition-all"><i className="fa-solid fa-plus-circle ml-2"></i> إضافة سيارة أخرى</button>
                <button onClick={()=>setNewRows([])} className="px-6 py-3 bg-gray-100 text-gray-400 rounded-xl font-black text-xs hover:bg-red-50 hover:text-red-500 transition-all">مسح الجدول</button>
              </div>
            </div>

            {newRows.length === 0 ? (
              <div className="p-20 text-center text-gray-300 font-black text-2xl border-4 border-dashed border-gray-50 rounded-[3rem]">ابدأ بإضافة سيارة من الزر بالأعلى</div>
            ) : (
               <div className="space-y-4">
                 <div className="overflow-x-auto rounded-[2.5rem] border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50/50 text-gray-400 border-b border-gray-100">
                        <tr><th className="px-6 py-5 text-right font-black uppercase">النوع</th><th className="px-6 py-5 text-right font-black uppercase">رقم الهيكل VIN</th><th className="px-6 py-5 text-right font-black uppercase">بيانات السيارة</th><th className="px-6 py-5 text-center font-black uppercase">إجراء</th></tr>
                      </thead>
                      <tbody>
                        {newRows.map((row, i) => {
                          const car = findCarByVin(row.vin);
                          return (
                            <tr key={i} className="border-b border-gray-50 bg-white hover:bg-beige/5 transition-all">
                              <td className="px-6 py-5">
                                <select className="bg-transparent font-black text-brown outline-none text-xs" value={row.type} onChange={e=>{const r=[...newRows]; r[i].type=e.target.value; setNewRows(r);}}>
                                  <option value="shoot">تصوير فقط</option><option value="move">نقل فقط</option><option value="mixed">تصوير + نقل</option>
                                </select>
                              </td>
                              <td className="px-6 py-5">
                                <input className="w-full bg-gray-50 px-4 py-2 rounded-xl font-mono font-bold text-xs border border-gray-100 outline-none focus:border-brown" placeholder="VIN..." value={row.vin} onChange={e=>{const r=[...newRows]; r[i].vin=e.target.value; setNewRows(r);}} />
                              </td>
                              <td className="px-6 py-5">
                                {car ? (
                                  <div className="flex flex-col gap-0.5 animate-in fade-in">
                                    <span className="font-black text-brown text-xs">{car.car} - {car.variant}</span>
                                    <span className="text-[10px] text-beige font-bold">{car.location}</span>
                                  </div>
                                ) : <span className="text-gray-300 font-bold text-[10px] italic">سيتم عرض البيانات عند التعرف على الـ VIN</span>}
                              </td>
                              <td className="px-6 py-5 text-center">
                                <button onClick={()=>{const r=[...newRows]; r.splice(i,1); setNewRows(r);}} className="w-8 h-8 bg-red-50 text-red-300 rounded-lg hover:bg-red-500 hover:text-white transition-all"><i className="fa-solid fa-xmark"></i></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                 </div>
                 <button onClick={handleAddRequest} className="w-full bg-brown text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-brown/30 hover:scale-[1.01] transition-all">إرسال الطلب للمراجعة والبدء في التنفيذ</button>
               </div>
            )}
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {requests.filter(r => r.status !== 'منتهي').length === 0 ? <div className="col-span-full py-20 text-center text-gray-300 font-black text-xl">لا توجد طلبات جارية حالياً</div> : requests.filter(r => r.status !== 'منتهي').map(req => (
              <div key={req.id} onClick={() => setSelectedRequest(req)} className="p-8 rounded-[2.5rem] border border-gray-100 bg-gray-50/30 hover:shadow-2xl hover:bg-white transition-all cursor-pointer group border-r-4 border-r-beige/20 relative overflow-hidden">
                 <div className="flex justify-between items-start mb-6">
                   <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-xl border border-amber-100 shadow-sm">{req.status}</span>
                   <span className="text-[10px] text-gray-400 font-mono font-bold tracking-widest">REQ-#{req.id?.slice(-5).toUpperCase()}</span>
                 </div>
                 <h4 className="font-black text-brown text-lg mb-2">طلب {req.kind === 'shoot' ? 'تصوير سيارات' : req.kind === 'move' ? 'نقل سيارات' : 'عمليات مختلطة'}</h4>
                 <p className="text-[10px] text-gray-400 font-bold mb-6">إجمالي {req.total} سيارات محددة للعمل</p>
                 <div className="pt-6 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-black">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-beige"></div>{req.createdByName}</span>
                    <span>{req.createdAt?.toDate?.()?.toLocaleDateString('ar-SA')}</span>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-brown/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 bg-brown text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-black">تفاصيل الطلب REQ-{selectedRequest.id?.slice(-5).toUpperCase()}</h3>
                <p className="text-white/40 text-[10px] font-black mt-2 uppercase tracking-widest leading-relaxed">ترتيب التنفيذ ثابت: 1 الاستلام ← 2 الإرسال ← 3 الوصول ← 4 الإنهاء</p>
              </div>
              <button onClick={()=>setSelectedRequest(null)} className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all shadow-xl"><i className="fa-solid fa-xmark text-2xl text-white"></i></button>
            </div>
            
            <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {steps.map((step, idx) => (
                   <div key={idx} className={`p-6 rounded-3xl border transition-all ${idx === 0 ? 'bg-beige/5 border-beige/20' : 'bg-gray-50 border-gray-100'}`}>
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-3 tracking-widest">{step}</p>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-beige shadow-lg" style={{width: idx === 0 ? '60%' : '0%'}}></div></div>
                      <span className="text-[10px] font-black text-brown mt-3 block">{idx === 0 ? 'جاري التنفيذ' : 'انتظار'}</span>
                   </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-brown text-lg flex items-center gap-3"><i className="fa-solid fa-car text-beige"></i> السيارات داخل الطلب</h4>
                <div className="overflow-x-auto rounded-[2rem] border border-gray-100 shadow-sm">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50/50 text-gray-400 border-b border-gray-100">
                      <tr><th className="px-6 py-5 text-right font-black uppercase">VIN</th><th className="px-6 py-5 text-right font-black uppercase">السيارة</th><th className="px-6 py-5 text-right font-black uppercase">المكان</th><th className="px-6 py-5 text-right font-black uppercase">حالة التنفيذ</th></tr>
                    </thead>
                    <tbody>
                      {selectedRequest.rows?.map((row:any, i:number)=>(
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                          <td className="px-6 py-5 font-mono font-bold text-beige">{row.vin}</td>
                          <td className="px-6 py-5 font-black text-brown">{row.car} <span className="text-[9px] text-gray-400 font-bold block">{row.variant}</span></td>
                          <td className="px-6 py-5 text-gray-500 font-bold">{row.location}</td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-[10px] font-black">انتظار المرحلة 1</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0">
               <button className="flex-1 bg-brown text-white py-5 rounded-2xl font-black shadow-xl">تحديث حالة الطلب</button>
               <button onClick={()=>setSelectedRequest(null)} className="px-10 py-5 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Requests;
