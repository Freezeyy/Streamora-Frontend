// src/components/Navbar.js
import { Link } from 'react-router-dom';
import useLogout from '../pages/hooks/useLogout';
import useUserProfile from '../pages/hooks/useUserProfile';
import { useState } from 'react';

function Navbar() {
  const { logout } = useLogout();
  const userId = localStorage.getItem('user`s Id'); // Assuming userId is stored in localStorage after login
  const { profile, loading, error } = useUserProfile(userId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getInitials = (name) => {
    const initials = name.split(' ').map((n) => n[0]).join('');
    return initials.toUpperCase();
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-lg sticky top-0 z-50">
      <div className="flex justify-between items-center">
        <div className="text-white text-xl font-bold">SNOW</div>

        <div className="relative">
          {!loading && profile && (
            <div className="flex items-center space-x-4 cursor-pointer" onClick={toggleDropdown}>
              <img
                src={
                  profile.imageUrl
                    ? profile.imageUrl // If profile image exists, use it
                    : `https://ui-avatars.com/api/?name=${getInitials(profile.name)}&background=random&color=random&size=128`
                }
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-white">{profile.name}</span>
            </div>
          )}

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
              <ul className="py-1">
                <li>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}

          {loading && <div className="text-white">Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
