import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import RightColumn from "./RightColumn";
import Snowfall from "./Snowfall";
import "./css/Layout.css";

const LayoutColumn = ({ children, className = "" }) => (
  <div className={`layout-column ${className}`.trim()}>
    <div className="layout-column-scroll no-scrollbar">
      <div className="layout-column-content">
        {children}
      </div>
    </div>
  </div>
);

const Layout = ({ children, showRightColumn = false }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mainClass = [
    "layout-main",
    isCollapsed ? "layout-main--collapsed" : "",
  ].filter(Boolean).join(" ");

  const bodyClass = [
    "layout-body",
    showRightColumn ? "layout-body--split" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="app-shell">
      {isMobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={closeMobileSidebar}
          aria-label="Close sidebar"
        />
      )}

      <Sidebar
        isOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        onClose={closeMobileSidebar}
        onToggleCollapse={toggleCollapse}
      />

      <div className={mainClass}>
        <div className="layout-fixed-snow" aria-hidden="true">
          <Snowfall variant="subtle" />
        </div>

        <Topbar
          sidebarToggle={toggleMobileSidebar}
          onToggleCollapse={toggleCollapse}
          isCollapsed={isCollapsed}
        />

        <div className={bodyClass}>
          <LayoutColumn className="layout-main-column">
            {children}
          </LayoutColumn>

          {showRightColumn && (
            <LayoutColumn className="layout-right-column">
              <RightColumn />
            </LayoutColumn>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;
