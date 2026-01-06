
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AdminRequest, UserProfile, UserRole } from '../types';

interface PhotoshootUserProps {
  user: UserProfile;
}

const PhotoshootUser: React.FC<PhotoshootUserProps> = ({ user }) => {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newKind, setNewKind] = useState<'shoot' | 'move'>('shoot');
  const [vins, setVins] = useState('');

  useEffect(() => {
    // Only watch non-finished requests to save reads
    const q = query(
      collection(db, 'requests'),
      where('status', '!=', 'مكتملة'),
      orderBy('status'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminRequest));
      setRequests(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vins.trim()) return;

    const vinList = vins.split('\n').filter(v => v.trim()).map(v => v.trim());
    
    try {
      const docRef = await addDoc(collection(db, 'requests'), {
        kind: newKind,
        status: 'جديد',
        total: vinList.length,
        createdBy: user.name || user.email,
        createdByEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        vins: vinList
      });

      // Update central state for dashboard visibility
      const stateRef = doc(db, 'mzj_admin_state', 'v1');
      const snap = await getDoc(stateRef);
      if (snap.exists()) {
        const stateData = snap.data();
        const key = newKind === 'shoot' ? 'shootRequests' : 'moveRequests';
        const list = stateData[key] || [];
        list.unshift({ id: docRef.id, status: 'جديد', total: vinList.length, createdAt: new Date().toISOString() });
        await setDoc(stateRef, { [key]: list }, { merge: true });
      }

      setVins('');
      setShowCreate(false);
      alert('تم إنشاء الطلب بنجاح ✅');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إرسال الطلب');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-mzj-brown">إدارة طلبات العمليات</h2>
          <p className="text-sm text-gray-500">إدارة طلبات التصوير ونقل السيارات بين الفروع</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="bg-mzj-brown text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-mzj-brown/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <i className={`fa-solid ${showCreate ? 'fa-xmark' : 'fa-plus'}`}></i>
          {showCreate ? 'إلغاء' : 'إنشاء طلب جديد'}
        </button>
      </header>

      {showCreate && (
        <div className="bg-white p-8 rounded-[40px] border-2 border-mzj-beige/30 shadow-xl animate-in zoom-in-95 duration-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-mzj-brown block">نوع الطلب</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewKind('shoot')}
                    className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                      newKind === 'shoot' ? 'bg-mzj-brown text-white border-mzj-brown' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-mzj-beige/20'
                    }`}
                  >
                    <i className="fa-solid fa-camera mb-2 block text-xl"></i>
                    طلب تصوير
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewKind('move')}
                    className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                      newKind === 'move' ? 'bg-mzj-brown text-white border-mzj-brown' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-mzj-beige/20'
                    }`}
                  >
                    <i className="fa-solid fa-truck-moving mb-2 block text-xl"></i>
                    طلب نقل
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-mzj-brown block">أرقام الهياكل (VIN)</label>
                <textarea
                  className="w-full h-32 px-4 py-3 rounded-3xl bg-gray-50 border-2 border-gray-100 focus:border-mzj-beige focus:bg-white transition-all text-sm font-mono outline-none resize-none"
                  placeholder="ضع كل رقم هيكل في سطر منفصل..."
                  value={vins}
                  onChange={(e) => setVins(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 font-bold">سيتم إنشاء سطر لكل رقم هيكل يتم إدخاله.</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-mzj-beige text-white px-12 py-4 rounded-2xl font-black shadow-lg shadow-mzj-beige/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                إرسال الطلب للمراجعة
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map(req => (
          <div key={req.id} className="bg-white rounded-3xl border border-mzj-beige/20 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className="p-5 flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                    req.kind === 'shoot' ? 'bg-mzj-beige' : 'bg-mzj-brown'
                  }`}>
                    <i className={`fa-solid ${req.kind === 'shoot' ? 'fa-camera' : 'fa-truck-moving'}`}></i>
                  </div>
                  <div>
                    <h3 className="font-black text-mzj-brown leading-tight">طلب {req.kind === 'shoot' ? 'تصوير' : 'نقل'}</h3>
                    <p className="text-[10px] text-gray-500 font-bold">رقم الطلب: #{req.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-mzj-cream text-mzj-brown px-3 py-1.5 rounded-full border border-mzj-beige/30">
                  {req.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-y border-gray-50">
                <div className="text-center flex-1 border-l border-gray-50">
                  <p className="text-[10px] text-gray-400 font-bold mb-1">السيارات</p>
                  <p className="text-lg font-black text-mzj-brown">{req.total}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-[10px] text-gray-400 font-bold mb-1">المنشئ</p>
                  <p className="text-xs font-black text-gray-600 truncate px-2">{req.createdBy}</p>
                </div>
              </div>
            </div>
            <button className="w-full py-4 bg-gray-50 text-mzj-brown font-black text-sm hover:bg-mzj-brown hover:text-white transition-all">
              عرض التفاصيل والمتابعة
            </button>
          </div>
        ))}

        {requests.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center text-gray-400">
            <i className="fa-solid fa-inbox text-5xl mb-4 block"></i>
            <p className="font-bold">لا توجد طلبات نشطة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoshootUser;
