
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('خطأ في بيانات الدخول، تأكد من الإيميل وكلمة المرور');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mzj-cream p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[40px] border border-mzj-beige/30 shadow-2xl shadow-mzj-brown/10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-mzj-brown text-white rounded-3xl flex items-center justify-center text-4xl font-black mb-6 shadow-xl shadow-mzj-brown/20">MZJ</div>
          <h2 className="text-3xl font-black text-mzj-brown tracking-tight">نظام العمل المركزي</h2>
          <p className="mt-2 text-sm text-gray-400 font-medium">مجموعة محمد بن ذعار العجمي للسيارات</p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-mzj-brown mr-1 mb-2 uppercase tracking-widest">البريد الإلكتروني</label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-mzj-beige focus:bg-white transition-all text-sm outline-none"
                placeholder="example@mzjcars.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-mzj-brown mr-1 mb-2 uppercase tracking-widest">كلمة المرور</label>
              <input
                type="password"
                required
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-mzj-beige focus:bg-white transition-all text-sm outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-mzj-brown text-white rounded-2xl font-black text-sm shadow-xl shadow-mzj-brown/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول للنظام'}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-tighter">MZJ Cars Internal Workspace v2.0</p>
      </div>
    </div>
  );
};

export default Login;
