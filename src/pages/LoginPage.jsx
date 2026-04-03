import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabaseClient';   // ← adjust path if needed
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setAuthError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setAuthError(error.message);
    } else {
      // M4's login guard will handle navigation
      navigate('/products');
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setAuthError(error.message);
    setIsLoading(false);
  };

  return (
    <div className="bg-surface font-body text-on-surface flex flex-col min-h-screen">
      {/* Header - matching Stitch */}
      <header className="bg-[#f7f9fb] flex justify-between items-center w-full px-8 py-4">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold tracking-tighter text-[#0053db] font-headline uppercase">
            HOPE, INC.
          </span>
          <div className="hidden md:block w-px h-6 bg-gray-300" />
          <span className="hidden md:block font-headline tracking-tight text-sm font-semibold opacity-70">
            Product Management System
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-gray-500">help</span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Background blur elements (optional but nice) */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />

        <div className="w-full max-w-md z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 md:p-10 shadow-xl ring-1 ring-gray-200">
            <div className="mb-8">
              <h1 className="font-headline text-2xl font-extrabold tracking-tight mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-500 text-sm">
                Enter your credentials to access the system.
              </p>
            </div>

            {authError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    mail
                  </span>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="name@hope-inc.edu"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block">
                    Password
                  </label>
                  <a href="#" className="text-xs text-blue-600 hover:underline">Forgot Password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    lock
                  </span>
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-br from-[#0053db] to-blue-700 text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all text-sm tracking-wide disabled:opacity-70"
              >
                {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold"
            >
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS96meANgyC96jxyiY_7zZ5EGtgR2W5SlXH9IHTlTSJ6FGTpZkYv3NxmYUV0lksadbDANUxEAervHoH8nV0QFea_HA3znENsEhNl6VeMNLDKuWB74XY2b-Lb2bG005vNDms9-xf5MIKgf9eJ1N1_vi2OyPOqCFEVUah2L1698BgrKeZcTxGtw3uAQ3uXPSVUHHR1I5A4FtBOiXZx_3Ql744W7qAje_lh2MYGRLnXfRxvMmge0nz8MlKL96HIqhbytXv0NoXWDktvSX" 
                alt="Google" 
                className="w-5 h-5" 
              />
              Continue with Google Account
            </button>

            {/* Register Link */}
            <div className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-[#0053db] hover:underline">
                Create an institutional ID
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#f7f9fb] py-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-600">New Era University</span>
            <span className="text-xs text-gray-400 ml-2">© 2025</span>
          </div>
          <div className="flex gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600">Institutional Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}