import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Home from './pages/Home';
import Login from './pages/Login';
import type { UserProfile } from './types/user';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function AppContent() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [logoutTimer, setLogoutTimer] = useState<number | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('user_profile');
    localStorage.removeItem('jwt_token');
    setUser(null);
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
  };

  const handleLogin = (userProfile: UserProfile, token: string) => {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_profile', JSON.stringify(userProfile));
    setUser(userProfile);

    // Set automatic logout when token expires
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const timeUntilExpiry = (decoded.exp * 1000) - Date.now();

      if (timeUntilExpiry > 0) {
        if (logoutTimer) clearTimeout(logoutTimer);
        const timer = setTimeout(() => {
          console.log('Token expired, logging out');
          handleLogout();
        }, timeUntilExpiry);
        setLogoutTimer(timer);
      }
    } catch (error) {
      console.error('Failed to decode token for expiry:', error);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user_profile');
    const token = localStorage.getItem('jwt_token');

    if (savedUser && token) {
      try {
        const decoded = jwtDecode<{ exp: number }>(token);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          handleLogout();
        } else {
          setUser(JSON.parse(savedUser));

          // Reschedule logout timer
          const timeUntilExpiry = (decoded.exp * 1000) - Date.now();
          if (timeUntilExpiry > 0) {
            const timer = setTimeout(() => {
              console.log('Token expired, logging out');
              handleLogout();
            }, timeUntilExpiry);
            setLogoutTimer(timer);
          }
        }
      } catch (error) {
        console.error("Failed to parse saved user profile or token:", error);
        handleLogout();
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen transition-all duration-700 ${theme === 'dark'
        ? 'bg-black'
        : 'bg-linear-to-br from-[#FFCC99] via-[#FFB366] to-[#FFA240]'
        }`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'dark'
          ? 'border-[#FFA240]'
          : 'border-[#D73535]'
          }`}></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
        />
        {/* Catch all redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  const [themeInitialized, setThemeInitialized] = useState(false);

  useEffect(() => {
    // Initialize theme on first load
    const savedTheme = localStorage.getItem('theme');
    let theme: 'light' | 'dark';

    if (savedTheme === 'light' || savedTheme === 'dark') {
      theme = savedTheme;
    } else {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    localStorage.setItem('theme', theme);
    setThemeInitialized(true);
  }, []);

  if (!themeInitialized) return null;

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
