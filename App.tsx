
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { UserRole } from './types';

// Pages - Ensure relative paths start with ./
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Admin from './pages/Admin';
import Sales from './pages/Sales';
import Requests from './pages/Requests';
import Vehicles from './pages/Vehicles';
import History from './pages/History';
import Activity from './pages/Activity';
import CarsReport from './pages/CarsReport';
import MediaReport from './pages/MediaReport';
import VehicleTransfer from './pages/VehicleTransfer';

const menuItems = [
  { path: '/dashboard', label: 'الداش بورد', icon: 'fa-gauge', roles: [UserRole.ADMIN, UserRole.IDARI, UserRole.BRANCH] },
  { path: '/inventory', label: 'المخزون', icon: 'fa-boxes-stacked', roles: [UserRole.ADMIN, UserRole.IDARI, UserRole.BRANCH] },
  { path: '/transfer', label: 'نقل السيارات', icon: 'fa-truck-arrow-right', roles: [UserRole.ADMIN, UserRole.IDARI] },
  { path: '/requests', label: 'إدارة الطلبات', icon: 'fa-camera', roles: [UserRole.ADMIN, UserRole.IDARI] },
  { path: '/sales', label: 'تتبع المبيعات', icon: 'fa-handshake', roles: [UserRole.ADMIN, UserRole.IDARI] },
  { path: '/cars-report', label: 'تقرير السيارات', icon: 'fa-file-invoice', roles: [UserRole.ADMIN, UserRole.IDARI] },
  { path: '/media', label: 'مفتاح المواصفات', icon: 'fa-photo-film', roles: [UserRole.ADMIN, UserRole.IDARI] },
  { path: '/admin', label: 'الإدارة', icon: 'fa-shield-halved', roles: [UserRole.ADMIN] },
  { path: '/activity', label: 'سجل النشاط', icon: 'fa-clipboard-list', roles: [UserRole.ADMIN] },
  { path: '/history', label: 'سجل الحركات', icon: 'fa-history', roles: [UserRole.ADMIN, UserRole.IDARI] },
];

const SidebarContent = ({ role, onItemClick }: { role: string | null, onItemClick?: () => void }) => {
  const location = useLocation();
  return (
    <div className="p-6 flex flex-col h-full bg-white">
      <div className="flex items-center gap-4 mb-10 px-2">
        <div className="w-12 h-12 bg-brown rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl shadow-brown/30">MZJ</div>
        <div>
          <h1 className="text-sm font-black text-brown">MZJ Workspace</h1>
          <span className="text-[10px] text-beige font-bold tracking-widest uppercase">النسخة الاحترافية</span>
        </div>
      </div>
      <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {menuItems.map(item => (
          (!item.roles || item.roles.includes(role as UserRole)) && (
            <Link
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                location.pathname === item.path ? 'bg-brown text-white shadow-lg' : 'text-gray-500 hover:bg-beige/10 hover:text-brown'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center text-lg`}></i>
              <span className="font-bold text-sm">{item.label}</span>
            </Link>
          )
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-gray-100">
        <button onClick={() => signOut(auth)} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl w-full text-red-500 hover:bg-red-50 transition-all font-bold text-sm">
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'user', u.uid));
        if (snap.exists()) setRole(snap.data().role);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-cream font-black">جاري التحميل...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-[#FDFCFB] flex">
        {!user ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <>
            <aside className="w-72 bg-white border-l border-gray-100 h-screen sticky top-0 overflow-y-auto hidden lg:block shadow-sm z-50">
              <SidebarContent role={role} />
            </aside>
            {isSidebarOpen && (
              <div className="fixed inset-0 bg-brown/40 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                <div className="w-72 bg-white h-full shadow-2xl animate-slide-left" onClick={e => e.stopPropagation()}>
                  <SidebarContent role={role} onItemClick={() => setIsSidebarOpen(false)} />
                </div>
              </div>
            )}
            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-20 bg-white/70 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40 flex items-center justify-between px-6">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-10 h-10 bg-beige/10 rounded-xl text-brown"><i className="fa-solid fa-bars"></i></button>
                <div className="text-sm font-black text-brown">أهلاً بك: {user?.email?.split('@')[0]}</div>
                <div className="text-xs text-gray-400 font-bold">{new Date().toLocaleDateString('ar-SA')}</div>
              </header>
              <main className="p-4 lg:p-10 max-w-[1600px] mx-auto w-full">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/requests" element={<Requests />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/cars-report" element={<CarsReport />} />
                  <Route path="/media" element={<MediaReport />} />
                  <Route path="/transfer" element={<VehicleTransfer />} />
                  <Route path="/admin" element={role === UserRole.ADMIN ? <Admin /> : <Navigate to="/dashboard" />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/history" element={<History />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </>
        )}
      </div>
    </Router>
  );
};
export default App;
