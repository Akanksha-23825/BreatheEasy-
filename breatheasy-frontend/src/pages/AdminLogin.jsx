import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiShield, FiArrowRight } from 'react-icons/fi';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Using 127.0.0.1 to avoid localhost resolution issues
      const res = await axios.post('http://127.0.0.1:5000/api/admin/login', { email, password });
      localStorage.setItem('adminUser', JSON.stringify(res.data));
      navigate('/admin/dashboard');
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || 'Connection failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden font-['Inter']">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-600/5 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-lg relative">
        {/* Decorative Ring */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 md:p-14 shadow-2xl overflow-hidden">
          {/* Top Branding */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-red-500/20 blur-xl rounded-full animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-tr from-red-600 to-orange-500 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-red-600/40 border border-white/20">
                BE
              </div>
            </div>
            <h1 className="text-white text-4xl font-extrabold tracking-tight mb-3">Admin Portal</h1>
            <div className="h-1 w-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-4"></div>
            <p className="text-slate-400 text-center font-medium">BreatheEasy+ Central Intelligence Terminal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
              <div className="relative group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Identity</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors">
                    <FiMail className="text-xl" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all text-lg"
                    placeholder="admin@breatheasy.com"
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 mb-2 block">Secret Key</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors">
                    <FiLock className="text-xl" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all text-lg"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl text-sm flex items-center gap-3 animate-shake">
                <FiShield className="shrink-0 text-lg" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span>{loading ? 'Decrypting Access...' : 'Authenticate'}</span>
              {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
              <FiShield className="text-red-500" />
              Secure Terminal Access
            </div>
            <p className="text-slate-600 text-xs text-center px-8">
              Access to this terminal is restricted to authorized BreatheEasy+ administrators. All activities are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
