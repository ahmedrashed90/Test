
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

const Activity = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'mzj_activity_log'), orderBy('ts', 'desc'), limit(100)), (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-black text-brown">سجل النشاط العام</h2>
          <p className="text-xs text-gray-400 font-bold mt-1">تتبع كافة العمليات المنفذة على النظام</p>
        </div>
        <div className="bg-gray-50 px-4 py-2 rounded-xl text-xs font-black text-brown border border-gray-100">الإجمالي: {logs.length} صف</div>
      </div>

      <div className="space-y-4">
        {loading ? <div className="p-20 text-center font-black text-gray-300 animate-pulse">جارِ التحميل...</div> : logs.map((log, i) => (
          <div key={i} className="flex gap-4 p-5 rounded-[2rem] bg-gray-50/50 border border-gray-50 hover:border-beige/20 hover:bg-white transition-all group">
            <div className="w-12 h-12 bg-beige/10 rounded-2xl flex items-center justify-center text-brown shrink-0 group-hover:bg-brown group-hover:text-white transition-all">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start mb-1">
                 <h4 className="text-sm font-black text-brown truncate">{log.action || 'عملية نظام'}</h4>
                 <span className="text-[9px] font-black text-gray-300 uppercase">{log.ts?.toDate?.()?.toLocaleString('ar-SA')}</span>
               </div>
               <p className="text-xs text-gray-500 font-bold leading-relaxed">{log.details}</p>
               <div className="mt-3 flex gap-2">
                 <span className="px-2 py-0.5 bg-white border border-gray-100 rounded-md text-[9px] font-black text-gray-400 uppercase tracking-tighter">{log.userName || log.userEmail}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Activity;
