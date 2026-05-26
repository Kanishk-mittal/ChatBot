import { googleLogout } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

interface LogoutButtonProps {
  onLogout: () => void;
  className?: string;
}

export default function LogoutButton({ onLogout, className = "" }: LogoutButtonProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    googleLogout();
    
    // Clear localStorage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_profile');
    
    onLogout();
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className={`py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${className}`}
    >
      Log Out
    </button>
  );
}
