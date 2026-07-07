import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaBars, FaUser } from "react-icons/fa";
import useLogout from "./hooks/useLogout";
import useUserProfile from "./hooks/useUserProfile";
import useUserSearch from "./hooks/useUserSearch";
import { isAuthenticated } from "../utils/auth";
import "./css/Topbar.css";

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getAvatarSrc = (user) => {
  if (user?.image || user?.imageUrl) return user.image || user.imageUrl;
  if (user?.name) {
    return `https://ui-avatars.com/api/?name=${getInitials(user.name)}&background=random&color=random&size=128`;
  }
  return null;
};

function Topbar({ sidebarToggle, onToggleCollapse, isCollapsed }) {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const userId = localStorage.getItem("user`s Id");
  const { profile, loading, error } = useUserProfile(userId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { results, loading: searchLoading, clearResults } = useUserSearch(searchTerm);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsSearchOpen(searchTerm.trim().length >= 2);
  }, [searchTerm]);

  const handleSelectUser = (id) => {
    setSearchTerm("");
    clearResults();
    setIsSearchOpen(false);
    navigate(`/profile/${id}`);
  };

  return (
    <header className="app-topbar">
      {sidebarToggle && (
        <button
          type="button"
          className="topbar-icon-btn topbar-mobile-toggle"
          onClick={sidebarToggle}
          aria-label="Open menu"
        >
          <FaBars />
        </button>
      )}

      {/* {onToggleCollapse && (
        <button
          type="button"
          className="topbar-icon-btn topbar-desktop-toggle"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      )} */}

      <div className="flex items-center justify-center flex-1 mx-4" ref={searchRef}>
        <div className="w-full max-w-md relative search-wrapper">
          <input
            type="text"
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (searchTerm.trim().length >= 2) setIsSearchOpen(true);
            }}
            className="topbar-search-input"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />

          {isSearchOpen && (
            <div className="search-results">
              {searchLoading && (
                <p className="search-results-status">Searching...</p>
              )}

              {!searchLoading && results.length === 0 && (
                <p className="search-results-status">No users found</p>
              )}

              {!searchLoading && results.length > 0 && (
                <ul className="search-results-list">
                  {results.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        className="search-result-item"
                        onClick={() => handleSelectUser(user.id)}
                      >
                        <img
                          src={getAvatarSrc(user)}
                          alt={user.name}
                          className="search-result-avatar"
                        />
                        <div className="search-result-info">
                          <span className="search-result-name">{user.name}</span>
                          <span className="search-result-email">{user.email}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative flex-shrink-0" ref={dropdownRef}>
        {isAuthenticated() && (
          <button
            type="button"
            className="flex items-center space-x-3 cursor-pointer"
            onClick={toggleDropdown}
          >
            {profile ? (
              <img
                src={getAvatarSrc(profile)}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <FaUser className="text-gray-600" />
              </span>
            )}
            <span className="topbar-username">
              {profile?.name || (loading ? 'Loading…' : 'Account')}
            </span>
          </button>
        )}

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <ul className="py-1">
              {profile && (
                <li>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}

        {error && !isDropdownOpen && (
          <div className="text-red-600 text-sm">Session expired</div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
