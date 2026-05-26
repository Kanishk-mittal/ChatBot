import type { UserProfile } from '../types/user';
import LogoutButton from '../components/LogoutButton';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

interface HomeProps {
  user: UserProfile;
  onLogout: () => void;
}

export default function Home({ user, onLogout }: HomeProps) {
  const { theme } = useTheme();

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 transition-all duration-700 relative overflow-hidden ${theme === 'dark'
        ? 'bg-black'
        : 'bg-gradient-to-br from-[#FFCC99] via-[#FFB366] to-[#FFA240]'
      }`}>
      {/* Light Mode Decorative Elements */}
      {theme === 'light' && (
        <>
          <div className="absolute top-[-5%] right-[-5%] w-64 h-64 bg-[#FFD41D]/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-white/30 rounded-full blur-3xl"></div>
        </>
      )}

      {/* Background Decorative Glows */}
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

      <div className={`max-w-md w-full backdrop-blur-xl border-2 rounded-[2.5rem] p-10 text-center relative z-10 transition-all duration-500 ${theme === 'dark'
          ? 'bg-white/5 border-white/10 shadow-none'
          : 'bg-white/90 border-white shadow-2xl shadow-[#FF4646]/20'
        }`}>
        <h2 className={`text-3xl font-black mb-8 italic uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
          M<span className={theme === 'dark' ? 'text-[#FFA240]' : 'text-[#FF4646]'}>AX</span> Dashboard
        </h2>

        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6 transform hover:scale-105 transition-transform duration-300">
            <img
              src={user.picture}
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-[#FFA240] shadow-xl shadow-[#FFA240]/20"
            />
            <div className={`absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 rounded-full shadow-lg ${theme === 'dark' ? 'border-black' : 'border-white'
              }`}></div>
          </div>
          <h3 className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
            {user.name}
          </h3>
          <p className={`font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
            {user.email}
          </p>
        </div>

        <LogoutButton
          onLogout={onLogout}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D73535] to-[#FF4646] hover:from-[#FF4646] hover:to-[#D73535] border-none shadow-xl shadow-red-500/20 text-white font-bold text-lg tracking-wide transform active:scale-95 transition-all"
        />

        <p className={`mt-8 text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'
          }`}>
          Access Level: Authorized User
        </p>
      </div>
    </div>
  );
}
