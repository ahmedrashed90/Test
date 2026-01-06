
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

const Login = () => {
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
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_top,#fff8ef_0,#fff_50%,#fbe9da_100%)]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-beige/20 p-8">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-brown rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-brown/30">MZJ</div>
        </div>
        
        <h2 className="text-2xl font-black text-brown text-center mb-2">تسجيل الدخول</h2>
        <p className="text-gray-500 text-center text-sm mb-8">لوحة تحكم مجموعة محمد بن ذعار العجمي</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-brown mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-beige focus:ring-4 focus:ring-beige/10 outline-none transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-brown mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-beige focus:ring-4 focus:ring-beige/10 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brown text-white py-4 rounded-xl font-bold hover:bg-brown-dark transition-all shadow-lg shadow-brown/20 disabled:opacity-50 mt-6"
          >
            {loading ? 'جاري التحميل...' : 'دخول'}
          </button>
        </form>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full mt-4 text-brown font-bold text-sm hover:underline"
        >
          إنشاء حساب جديد
        </button>
      </div>
    </div>
  );
};

export default Login;
