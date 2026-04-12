import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function Login() {
  const { user, isLoading, signOut } = useAuth();

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      console.error('Google sign in error:', error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#2a3439] font-body">
      <header className="bg-[#f7f9fb] px-6 py-4 border-b border-[#d9e4ea] lg:px-8">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tighter text-[#0053db] font-headline uppercase">HOPE, INC.</span>
            <div className="hidden md:block h-6 w-px bg-[#717c82]/30" />
            <p className="hidden md:block text-sm font-semibold text-[#2a3439] opacity-70">Product Management System</p>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#e8eff3] text-[#506076]">
            <span className="material-symbols-outlined text-sm">help</span>
          </div>
        </div>
      </header>

      <main className="relative flex flex-col items-center justify-center px-6 py-10 sm:py-14 lg:py-16">
        <div className="pointer-events-none absolute top-0 right-0 mt-[-8rem] mr-[-8rem] w-[420px] h-[420px] rounded-full bg-[#0053db]/6 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 mb-[-8rem] ml-[-6rem] w-[320px] h-[320px] rounded-full bg-[#605c78]/6 blur-[100px]" />

        <div className="relative w-full max-w-[420px] z-10">
          <div className="text-center mb-8 space-y-2 md:hidden">
            <h1 className="text-2xl font-bold tracking-tight font-headline">Product Management System</h1>
            <p className="text-sm text-[#566166]">Access your curator dashboard</p>
          </div>

          <div className="bg-white academic-glass border border-[#d9e4ea]/80 rounded-3xl p-6 sm:p-8 shadow-[0_20px_40px_rgba(42,52,57,0.06)]">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#2a3439]">Sign In</h2>
              <p className="mt-2 text-sm text-[#566166]">Use your institutional Google account to continue</p>
            </div>

            {isLoading ? (
              <div className="rounded-[2rem] border border-[#d9e4ea] bg-[#f7f9fb] px-6 py-8 text-center text-sm text-[#566166]">
                Loading authentication status…
              </div>
            ) : user ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-[#2a3439]">You are signed in as</p>
                <p className="font-semibold text-[#2a3439]">{user.email ?? user.id}</p>
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full rounded-2xl border border-[#d9e4ea] bg-[#f7f9fb] px-4 py-4 text-sm font-semibold text-[#2a3439] transition hover:bg-[#e8eff3]"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#a9b4b9]/20 bg-[#f0f4f7] px-4 py-4 text-sm font-semibold text-[#2a3439] transition hover:bg-[#e8eff3] active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-[#566166]">
                Don't have an account?
                <a className="ml-1 font-bold text-[#0053db] hover:underline underline-offset-4" href="#">
                  Register
                </a>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#717c82] font-bold opacity-60">Secure Academic Environment</p>
          </div>
        </div>
      </main>

      <footer className="bg-[#f7f9fb] border-t border-[#a9b4b9]/15 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-4">
            <span className="font-headline text-sm font-semibold text-[#506076]">New Era University</span>
            <span className="hidden md:inline text-[10px] uppercase tracking-[0.2em] text-[#506076]/40">© 2024</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase tracking-[0.2em] text-[#566166] md:justify-end">
            <a className="transition hover:text-[#0053db]" href="#">Privacy Policy</a>
            <a className="transition hover:text-[#0053db]" href="#">Institutional Terms</a>
            <a className="transition hover:text-[#0053db]" href="#">Research Archive</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
