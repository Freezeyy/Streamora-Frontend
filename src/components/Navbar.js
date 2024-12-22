import { Link } from "react-router-dom";
import useLogout from "../pages/hooks/useLogout";
import useUserProfile from "../pages/hooks/useUserProfile";
import { useState } from "react";
import logo from "../assets/logo.png"; // Path relative to Sidebar.js
import { FaSearch } from "react-icons/fa"; // Importing search icon

function Navbar() {
  const { logout } = useLogout();
  const userId = localStorage.getItem("user`s Id"); // Assuming userId is stored in localStorage after login
  const { profile, loading, error } = useUserProfile(userId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [closeTimer, setCloseTimer] = useState(null); // To store the close timer

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getInitials = (name) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("");
    return initials.toUpperCase();
  };

  const handleMouseEnter = () => {
    // Open the dropdown when hovering
    if (closeTimer) {
      clearTimeout(closeTimer); // Clear any existing close timer if re-entering
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // Set a timer to close the dropdown after 2 seconds
    const timer = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 2000); // 2 seconds delay before closing the menu
    setCloseTimer(timer);
  };

  return (
    <nav className="bg-white-800 p-2 shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Logo Section */}
        <div className="w-24 h-24 object-cover flex-shrink-0">
          <img
            src={logo} // Make sure the logo path is correct
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Search Bar Section */}
        <div className="flex-grow mx-4 relative">
          <input
            type="text"
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-1 pl-10 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-gray-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>

        {/* Profile Avatar Section */}
        <div
          className="relative flex-shrink-0"
          onMouseEnter={handleMouseEnter} // Open on hover
          onMouseLeave={handleMouseLeave} // Close after 2 seconds
        >
          {!loading && profile && (
            <div className="flex items-center space-x-4 cursor-pointer">
              <img
                src={
                  profile.imageUrl
                    ? profile.imageUrl // If profile image exists, use it
                    : `https://ui-avatars.com/api/?name=${getInitials(
                        profile.name
                      )}&background=random&color=random&size=128`
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
                    to="../profile"
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
          {!profile && !loading && !error && (
            <div>No profile data available</div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
