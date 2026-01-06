
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, UserRole } from '../types';

interface AdminProps {
  user: UserProfile;
}

const Admin: React.FC<AdminProps> = ({ user }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'user'), (snap) => {
      const data = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateRole = async (uid: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'user', uid), { role: newRole });
      alert('تم تحديث الصلاحية بنجاح ✅');
    } catch (err) {
      console.error(err);
      alert('خطأ في التحديث');
    }
  };

  if (user.role !== UserRole.ADMIN) {
    return <div className="p-8 text-center text-red-500 font-bold">غير مصرح لك بدخول صفحة الإدارة</div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-black text-mzj-brown">إدارة المستخدمين والصلاحيات</h2>
        <p className="text-sm text-gray-500">تحكم في وصول الموظفين لمختلف أقسام النظام</p>
      </header>

      <div className="bg-white rounded-3xl border border-mzj-beige/20 shadow-sm overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-mzj-cream text-mzj-brown text-xs font-black uppercase tracking-wider">
              <th className="px-6 py-4">البريد الإلكتروني</th>
              <th className="px-6 py-4">الاسم</th>
              <th className="px-6 py-4">الصلاحية الحالية</th>
              <th className="px-6 py-4">تغيير الصلاحية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-mzj-cream/5 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-mzj-brown">{u.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{u.name || '---'}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                    u.role === UserRole.ADMIN ? 'bg-mzj-brown text-white' : 'bg-mzj-cream text-mzj-brown'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {Object.values(UserRole).map(role => (
                      <button
                        key={role}
                        onClick={() => updateRole(u.uid, role)}
                        disabled={u.role === role}
                        className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-all ${
                          u.role === role 
                            ? 'bg-gray-100 text-gray-400 border-transparent cursor-default' 
                            : 'bg-white border-mzj-beige/30 text-mzj-brown hover:bg-mzj-beige hover:text-white'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
