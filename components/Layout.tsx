
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { UserProfile } from '../types';
import { ROLE_PAGES } from '../constants';

interface LayoutProps {
  user: UserProfile;
}

const Layout: React.FC<LayoutProps> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', path: '/dashboard', label: 'الداشبورد', icon: 'fa-gauge' },
    { id: 'inventory', path: '/inventory', label: 'المخزون', icon: 'fa-boxes-stacked' },
    { id: 'cars', path: '/cars', label: 'السيارات', icon: 'fa-car' },
    { id: 'vt', path: '/vt', label: 'نقل السيارات', icon: 'fa-right-left' },
    { id: 'sales', path: '/sales', label: 'المبيعات', icon: 'fa-file-invoice-dollar' },
    { id: 'media', path: '/media', label: 'الميديا', icon: 'fa-photo-film' },
    { id: 'photoshoot-user', path: '/photoshoot-user', label: 'الطلبات والتصوير', icon: 'fa-camera' },
    { id: 'act', path: '/act', label: 'سجل النشاط', icon: 'fa-clipboard-list' },
    { id: 'admin', path: '/admin', label: 'الإدارة', icon: 'fa-shield-halved' },
  ];

  const allowedPages = ROLE_PAGES[user.role] || [];
  const visibleNav = navItems.filter(item => 
    allowedPages === 'ALL' || allowedPages.includes(item.id)
  );

  return (
    <div className="min-h-screen bg-mzj-cream flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-mzj-beige shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-mzj-brown text-white p-2 rounded-lg font-black text-xl tracking-tighter">MZJ</div>
            <div>
              <h1 className="text-mzj-brown font-bold leading-none">محمد بن ذعار العجمي</h1>
              <p className="text-xs text-gray-500">Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-left mr-4">
              <span className="text-sm font-bold text-mzj-brown leading-none">{user.name || user.email}</span>
              <span className="text-[10px] text-gray-400">{user.role}</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-gray-100 hover:bg-gray-200 text-mzj-brown px-3 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              <i className="fa-solid fa-right-from-bracket ml-2"></i>
              خروج
            </button>
          </div>
        </div>
      </header>
      <nav className="bg-white border-b border-mzj-beige/30 sticky top-16 z-40 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {visibleNav.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                location.pathname === item.path || (location.pathname === '/' && item.id === 'dashboard')
                  ? 'border-mzj-brown text-mzj-brown bg-mzj-cream/50'
                  : 'border-transparent text-gray-500 hover:text-mzj-beige'
              }`}
            >
              <i className={`fa-solid ${item.icon} ml-2 opacity-70`}></i>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 animate-in fade-in duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
