import React from "react";
import { NavLink, Link } from "react-router-dom";
import { FaRss, FaUsers, FaCalendarAlt, FaCog, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import logo from "../assets/logo.png";
import small_logo from "../assets/small_logo.png";

const navItems = [
  { to: "/feed", label: "Feed", icon: FaRss },
  { to: "/community", label: "Community", icon: FaUsers },
  { to: "/calendar", label: "Calendar", icon: FaCalendarAlt },
  { to: "/settings", label: "Settings", icon: FaCog },
];

function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }) {
  const sidebarClass = [
    "sidebar",
    isOpen ? "sidebar--open" : "",
    isCollapsed ? "sidebar--collapsed" : "",
  ].filter(Boolean).join(" ");

  return (
    <aside className={sidebarClass}>
      <div className="sidebar-header">
        <Link to="/feed" className="sidebar-logo-link" onClick={onClose}>
          <img
            src={isCollapsed ? small_logo : logo}
            alt="Streamora"
            className="sidebar-logo"
          />
        </Link>

        {/* {!isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="sidebar-collapse-btn"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <FaChevronLeft />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="sidebar-collapse-btn sidebar-collapse-btn--expand"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <FaChevronRight />
          </button>
        )} */}
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-nav-list">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                title={isCollapsed ? label : undefined}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? "sidebar-nav-link--active" : ""}`
                }
              >
                <Icon className="text-lg flex-shrink-0" />
                {!isCollapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        onClick={onToggleCollapse}
        className="sidebar-collapse-footer"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <FaChevronRight /> : (
          <>
            <FaChevronLeft />
            <span className="text-sm">Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
}

export default Sidebar;
