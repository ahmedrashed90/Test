
import React, { useEffect, useState, useMemo } from 'react';
import { onSnapshot, doc, collection, getDocs, setDoc, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Car, Move, AdminRequest, UserProfile, UserRole } from '../types';
import { SOLD_OR_AGENCY_STATES } from '../constants';

interface DashboardProps {
  user: UserProfile;
}

type DashboardMode = 'rows' | 'stock' | 'shortagesBranches' | 'shoot' | 'transfers' | 'sales';

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stock, setStock] = useState<Car[]>([]);
  const [moves, setMoves] = useState<Move[]>([]);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState<DashboardMode | null>(null);

  useEffect(() => {
    const unsubState = onSnapshot(doc(db, 'mzj_admin_state', 'v1'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStock(data.stock || []);
        setMoves(data.moves || []);
      }
      setLoading(false);
    });

    const unsubRequests = onSnapshot(collection(db, 'requests'), (snap) => {
      const reqs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminRequest));
      setRequests(reqs);
    });

    return () => {
      unsubState();
      unsubRequests();
    };
  }, []);

  const stats = useMemo(() => {
    const available = stock.filter(c => !SOLD_OR_AGENCY_STATES.some(s => c.location.includes(s)));
    const pending = stock.filter(c => c.location.includes('مباع تحت التسليم'));
    const delivered = stock.filter(c => c.location.includes('مباع تم التسليم'));
    const agency = stock.filter(c => c.location.startsWith('الوكالة'));

    return {
      total: stock.length,
      available: available.length,
      pending: pending.length,
      delivered: delivered.length,
      agency: agency.length,
      moves: moves.length,
      requests: requests.filter(r => r.status !== 'مكتملة').length
    };
  }, [stock, moves, requests]);

  const handleApproveMove = async (moveIdx: number, type: 'admin' | 'finance', approved: boolean, notes: string) => {
    if (user.role !== UserRole.ADMIN) return alert("هذه الصلاحية للإدارة فقط");

    const newMoves = [...moves];
    const move = newMoves[moveIdx];
    
    if (type === 'admin') {
      move.adminApproved = approved;
      move.adminNotes = notes;
    } else {
      move.financeApproved = approved;
      move.financeNotes = notes;
    }

    try {
      await setDoc(doc(db, 'mzj_admin_state', 'v1'), { moves: newMoves }, { merge: true });
      // Logic for updating stock locations after both approvals would go here
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-mzj-beige font-bold animate-pulse">جاري تحميل البيانات الحية...</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-mzj-brown">لوحة التحكم المركزية</h2>
          <p className="text-sm text-gray-500">مرحباً {user.name || user.email} - ({user.role})</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-mzj-beige/30 shadow-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-gray-600">متصل الآن</span>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="المخزون المتاح" value={stats.available} icon="fa-boxes-stacked" color="brown" onClick={() => setCurrentMode('stock')} />
        <StatCard title="تحت التسليم" value={stats.pending} icon="fa-truck-loading" color="beige" onClick={() => setCurrentMode('rows')} />
        <StatCard title="تم التسليم" value={stats.delivered} icon="fa-circle-check" color="green" />
        <StatCard title="طلبات النقل" value={stats.moves} icon="fa-right-left" color="orange" onClick={() => setCurrentMode('transfers')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-mzj-brown flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-mzj-beige"></i>
              آخر حركات النقل
            </h3>
          </div>
          <div className="bg-white rounded-3xl border border-mzj-beige/20 shadow-sm overflow-hidden">
            <table className="w-full text-right">
              <thead className="bg-mzj-cream/50 text-mzj-brown text-[10px] font-black uppercase">
                <tr>
                  <th className="px-4 py-3">VIN</th>
                  <th className="px-4 py-3">من</th>
                  <th className="px-4 py-3">إلى</th>
                  <th className="px-4 py-3">الموافقة</th>
                  <th className="px-4 py-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {moves.slice(0, 10).map((move, idx) => (
                  <tr key={idx} className="hover:bg-mzj-cream/10 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-bold text-mzj-brown">{move.vin.slice(-8)}</td>
                    <td className="px-4 py-3 text-[10px] text-gray-500">{move.from}</td>
                    <td className="px-4 py-3 text-[10px] text-gray-500">{move.to}</td>
                    <td className="px-4 py-3">
                       <div className="flex gap-1">
                          <i className={`fa-solid fa-user-tie ${move.adminApproved ? 'text-green-500' : 'text-gray-300'}`} title="إداري"></i>
                          <i className={`fa-solid fa-coins ${move.financeApproved ? 'text-green-500' : 'text-gray-300'}`} title="مالي"></i>
                       </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-black ${
                        move.adminApproved && move.financeApproved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {move.adminApproved && move.financeApproved ? 'مكتمل' : 'انتظار'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-black text-mzj-brown flex items-center gap-2">
            <i className="fa-solid fa-camera text-mzj-beige"></i>
            طلبات العمليات
          </h3>
          <div className="bg-white p-4 rounded-3xl border border-mzj-beige/20 shadow-sm space-y-3">
            {requests.slice(0, 5).map((req) => (
              <div key={req.id} className="p-3 rounded-2xl bg-mzj-cream/30 border border-mzj-beige/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${req.kind === 'shoot' ? 'bg-mzj-beige' : 'bg-mzj-brown'}`}>
                    <i className={`fa-solid ${req.kind === 'shoot' ? 'fa-camera' : 'fa-truck-moving'}`}></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-mzj-brown">#{req.id.slice(-4)}</h4>
                    <p className="text-[10px] text-gray-500">{req.status}</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-mzj-beige border-b border-mzj-beige">تفاصيل</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal Overlay Logic (Placeholder) */}
      {currentMode && (
        <div className="fixed inset-0 z-[100] bg-mzj-brown/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-mzj-cream/30">
              <h2 className="text-xl font-black text-mzj-brown">تفاصيل: {currentMode}</h2>
              <button onClick={() => setCurrentMode(null)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
               <p className="text-gray-400 text-center py-20 font-bold italic">جاري تحميل بيانات التفاصيل العميقة...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: string; color: string; onClick?: () => void }> = ({ title, value, icon, color, onClick }) => {
  const colors: Record<string, string> = {
    brown: 'bg-mzj-brown text-white',
    beige: 'bg-mzj-beige text-white',
    green: 'bg-green-600 text-white',
    orange: 'bg-orange-500 text-white'
  };
  return (
    <div onClick={onClick} className="bg-white p-6 rounded-3xl border border-mzj-beige/20 shadow-sm hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <h4 className="text-3xl font-black text-mzj-brown">{value.toLocaleString()}</h4>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform ${colors[color]}`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
