import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useLogout from "./hooks/useLogout";
import useUserProfile from "./hooks/useUserProfile";
import logo from "../assets/logo.png"; // Path relative to Sidebar.js
import { FaSearch } from "react-icons/fa"; // Importing search icon

function Topbar({ sidebarToggle }) {
  const { logout } = useLogout();
  const userId = localStorage.getItem("user`s Id"); // Assuming userId is stored in localStorage after login
  const { profile, loading, error } = useUserProfile(userId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        console.log("Outside click detected, closing dropdown");
        setTimeout(() => setIsDropdownOpen(false), 100); // Delay closing
      } else {
        console.log("Click inside dropdown detected");
      }
    };
  
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  

  return (
    <nav className="h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between bg-teal-400">

      {/* Logo Section */}
      <div className="h-full flex items-center flex-shrink-0 cursor-pointer" onClick={sidebarToggle}>
        <img src={logo} alt="Logo" className="h-32 w-auto -ml-[19px]" />
      </div>


      {/* Search Bar Section */}
      <div className="flex items-center justify-center -ml-4 flex-1 mx-4 h-full">
        <div className="w-full max-w-md relative">
          <input
            type="text"
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-1 pl-10 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-gray-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {/* Profile Section */}
      <div className="h-full flex items-center">
        <div className="relative flex-shrink-0" onClick={toggleDropdown} ref={dropdownRef}>
          {!loading && profile && (
            <div className="flex items-center space-x-4 cursor-pointer">
              <img
                src={
                  profile.imageUrl
                    ? profile.imageUrl
                    : `https://ui-avatars.com/api/?name=${getInitials(profile.name)}&background=random&color=random&size=128`
                }
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-black-500">{profile.name}</span>
            </div>
          )}
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-4 mt-[140px] w-48 bg-sky-200 rounded-lg shadow-lg">
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
              <hr className="border-t border-gray-400 w-5/6 mx-auto my-1" />
              <li>
                <button
                  onClick={(e) => {
                    console.log("Logout button clicked");
                    e.stopPropagation(); // Ensure the button click isn't blocked
                    logout();
                  }}
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
    </nav>
  );
}

export default Topbar;