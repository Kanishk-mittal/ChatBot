import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '../types/user';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 font-sans transition-all duration-700 relative overflow-hidden ${theme === 'dark'
        ? 'bg-black'
        : 'bg-gradient-to-br from-[#FFCC99] via-[#FFB366] to-[#FFA240]'
      }`}>
      {/* Light Mode Decorative Bubbles */}
      {theme === 'light' && (
        <>
          <div className="absolute top-[-5%] right-[-5%] w-64 h-64 bg-[#FFD41D]/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-white/30 rounded-full blur-3xl"></div>
        </>
      )}

      {/* Dynamic Background Glows for Dark Mode */}
      {theme === 'dark' && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFD41D]/10 rounded-full blur-[120px] pointer-events-none opacity-100 transition-opacity duration-1000"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FF4646]/10 rounded-full blur-[120px] pointer-events-none opacity-100 transition-opacity duration-1000"></div>
        </>
      )}

      {/* Theme Toggle Positioned Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Top Gradient Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#FFD41D] via-[#FFA240] to-[#FF4646] z-20"></div>

      <div className="w-full max-w-sm z-10">
        {/* Logo/Brand Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#FFD41D] via-[#FFA240] to-[#FF4646] flex items-center justify-center shadow-2xl mb-6 transform rotate-12 hover:rotate-0 transition-transform duration-300">
            <svg
              viewBox="0 0 24 24"
              className="w-12 h-12 text-white fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5-1.338c1.47.851 3.179 1.338 5 1.338 5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.477 0-2.864-.395-4.062-1.082l-2.938.784.784-2.938A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
              <circle cx="8" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="16" cy="12" r="1.5" />
            </svg>
          </div>
          <h1 className={`text-5xl font-black tracking-tighter mb-3 uppercase italic ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            M<span className={theme === 'dark' ? 'text-[#FFA240]' : 'text-[#FF4646]'}>AX</span>
          </h1>
          <p className={`text-center font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Intelligence in every <span className={theme === 'dark' ? 'text-[#FF4646]' : 'text-[#D73535]'}>conversation</span>.
          </p>
        </div>

        {/* Login Card */}
        <div className={`backdrop-blur-xl border-2 rounded-[2.5rem] p-10 shadow-2xl transition-all duration-500 ${theme === 'dark'
            ? 'bg-white/5 border-white/10 shadow-none'
            : 'bg-white/90 border-white shadow-[#FF4646]/20'
          }`}>
          <h2 className={`text-2xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>
            Welcome back
          </h2>

          <div className="flex flex-col gap-6">
            <div className="flex justify-center transform transition-transform hover:scale-[1.03] active:scale-[0.98]">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    const decoded = jwtDecode<UserProfile>(credentialResponse.credential);
                    localStorage.setItem('jwt_token', credentialResponse.credential);
                    localStorage.setItem('user_profile', JSON.stringify(decoded));
                    onLogin(decoded);
                    navigate('/');
                  }
                }}
                onError={() => console.error('Login Failed')}
                theme={theme === 'dark' ? 'filled_black' : 'outline'}
                shape="pill"
                size="large"
                width="100%"
              />
            </div>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t-2 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'
                  }`}></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className={`px-4 ${theme === 'dark' ? 'bg-transparent text-gray-600' : 'bg-white text-[#D73535]'
                  }`}>Secure Access</span>
              </div>
            </div>

            <p className={`text-[10px] leading-relaxed text-center px-2 uppercase tracking-tight ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
              }`}>
              By entering, you accept our <a href="#" className={`transition-colors font-bold ${theme === 'dark'
                  ? 'text-[#FFA240] hover:text-[#FFD41D]'
                  : 'text-[#D73535] hover:text-[#FF4646]'
                }`}>Terms of Service</a> & <a href="#" className={`transition-colors font-bold ${theme === 'dark'
                    ? 'text-[#FFA240] hover:text-[#FFD41D]'
                    : 'text-[#D73535] hover:text-[#FF4646]'
                  }`}>Privacy Protocol</a>.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className={`text-xs font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-gray-700' : 'text-gray-500'
            }`}>
            SYSTEM: MAX-AI-V1.0
          </p>
        </div>
      </div>
    </div>
  );
}
