
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
  const [reqType, setReqType] = useState('mixed');

  useEffect(() => {
    const unsubReq = onSnapshot(query(collection(db, 'requests'), orderBy('createdAt', 'desc'), limit(100)), (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as PhotoshootRequest)));
    });
    const unsubStock = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) setStock(snap.data().stock || []);
    });
    return () => { unsubReq(); unsubStock(); };
  }, []);

  const steps = ["تم استلام الطلب", "تم إرسال السيارة", "تم استلام السيارة", "تم الانتهاء"];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
      <div className="bg-gray-50/50 p-2 border-b border-gray-100 flex gap-1">
        <button onClick={() => setActiveTab('create')} className={`px-8 py-3 rounded-2xl font-black text-xs transition-all ${activeTab === 'create' ? 'bg-brown text-white' : 'text-gray-400'}`}>إنشاء طلب</button>
        <button onClick={() => setActiveTab('manage')} className={`px-8 py-3 rounded-2xl font-black text-xs transition-all ${activeTab === 'manage' ? 'bg-brown text-white' : 'text-gray-400'}`}>إدارة الطلبات</button>
        <button onClick={() => setActiveTab('done')} className={`px-8 py-3 rounded-2xl font-black text-xs transition-all ${activeTab === 'done' ? 'bg-brown text-white' : 'text-gray-400'}`}>الطلبات المكتملة</button>
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-brown">إنشاء طلب جديد (تصوير / نقل)</h2>
              <div className="flex gap-2">
                <button onClick={()=>setNewRows([...newRows, {vin:'', type:'shoot'}])} className="px-6 py-3 bg-brown text-white rounded-xl font-black text-xs shadow-lg shadow-brown/10">إضافة سيارة</button>
                <button onClick={()=>setNewRows([])} className="px-6 py-3 bg-gray-100 text-gray-400 rounded-xl font-black text-xs">إعادة ضبط</button>
              </div>
            </div>
            {newRows.length === 0 ? <div className="p-20 text-center text-gray-300 font-bold border-2 border-dashed border-gray-100 rounded-[2.5rem]">ابدأ بإضافة سيارات للطلب</div> : (
               <div className="overflow-x-auto border border-gray-100 rounded-3xl">
                 <table className="w-full text-xs">
                   <thead className="bg-gray-50 text-gray-400 border-b border-gray-100"><tr><th className="px-4 py-4 text-right">النوع</th><th className="px-4 py-4 text-right">VIN</th><th className="px-4 py-4 text-center">حذف</th></tr></thead>
                   <tbody>
                     {newRows.map((row, i) => (
                       <tr key={i} className="border-b border-gray-50">
                         <td className="px-4 py-4">
                           <select className="bg-transparent font-bold outline-none" value={row.type} onChange={e=>{const r=[...newRows]; r[i].type=e.target.value; setNewRows(r);}}>
                             <option value="shoot">تصوير</option><option value="move">نقل</option>
                           </select>
                         </td>
                         <td className="px-4 py-4"><input className="w-full bg-transparent font-mono outline-none" placeholder="رقم الهيكل" value={row.vin} onChange={e=>{const r=[...newRows]; r[i].vin=e.target.value; setNewRows(r);}} /></td>
                         <td className="px-4 py-4 text-center"><button onClick={()=>{const r=[...newRows]; r.splice(i,1); setNewRows(r);}} className="text-red-300 hover:text-red-500"><i className="fa-solid fa-trash-can"></i></button></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            )}
            {newRows.length > 0 && <button className="w-full bg-brown text-white py-4 rounded-2xl font-black shadow-xl">إرسال الطلب</button>}
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.filter(r => r.status !== 'منتهي').map(req => (
              <div key={req.id} onClick={() => setSelectedRequest(req)} className="p-6 rounded-3xl border border-gray-100 bg-gray-50/30 hover:shadow-xl transition-all cursor-pointer group">
                 <div className="flex justify-between items-start mb-4">
                   <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg border border-amber-100">{req.status}</span>
                   <span className="text-[10px] text-gray-400 font-mono">#{req.id?.slice(-5)}</span>
                 </div>
                 <h4 className="font-black text-brown text-sm">طلب {req.kind === 'shoot' ? 'تصوير' : req.kind === 'move' ? 'نقل' : 'مختلط'}</h4>
                 <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
                    <span className="font-bold"><i className="fa-solid fa-user-circle ml-1"></i>{req.createdByName}</span>
                    <span className="font-bold">{req.createdAt?.toDate?.()?.toLocaleDateString('ar-SA')}</span>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-brown/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-brown text-white flex justify-between items-center">
              <div><h3 className="text-xl font-black">تفاصيل الطلب</h3><p className="text-white/40 text-[10px] font-black mt-1 uppercase tracking-widest">ترتيب التنفيذ ثابت: 1 ← 2 ← 3 ← 4</p></div>
              <button onClick={()=>setSelectedRequest(null)} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {steps.map((step, idx) => (
                   <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-2">{step}</p>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-beige" style={{width:'0%'}}></div></div>
                   </div>
                ))}
              </div>
              <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                <table className="w-full text-[10px]">
                  <thead className="bg-gray-50 text-gray-400"><tr><th className="px-4 py-3 text-right">VIN</th><th className="px-4 py-3 text-right">السيارة</th><th className="px-4 py-3 text-right">حالة التنفيذ</th></tr></thead>
                  <tbody>{selectedRequest.rows?.map((row:any,i:number)=>(<tr key={i} className="border-b border-gray-50"><td className="px-4 py-3 font-mono font-bold text-beige">{row.vin}</td><td className="px-4 py-3 font-black text-brown">{row.car}</td><td className="px-4 py-3 text-gray-400">بانتظار الاستلام</td></tr>))}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Requests;
