
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { UserProfile, UserRole } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Media from './pages/Media';
import PhotoshootUser from './pages/PhotoshootUser';
import Cars from './pages/Cars';
import VT from './pages/VT';
import Sales from './pages/Sales';
import Activity from './pages/Activity';
import Admin from './pages/Admin';
import Unauthorized from './pages/Unauthorized';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'user', fbUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as { role: UserRole, name?: string };
          setUser({
            uid: fbUser.uid,
            email: fbUser.email!,
            role: data.role,
            name: data.name
          });
        } else {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email!,
            role: UserRole.BRANCH_MANAGER
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mzj-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mzj-brown"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        
        <Route element={user ? <Layout user={user} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard user={user!} />} />
          <Route path="/dashboard" element={<Dashboard user={user!} />} />
          <Route path="/inventory" element={<Inventory user={user!} />} />
          <Route path="/media" element={<Media user={user!} />} />
          <Route path="/photoshoot-user" element={<PhotoshootUser user={user!} />} />
          <Route path="/cars" element={<Cars user={user!} />} />
          <Route path="/vt" element={<VT user={user!} />} />
          <Route path="/sales" element={<Sales user={user!} />} />
          <Route path="/act" element={<Activity user={user!} />} />
          <Route path="/admin" element={<Admin user={user!} />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
