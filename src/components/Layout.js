// src/components/Layout.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import RightColumn from "./RightColumn";
import './css/Layout.css'

const Layout = ({ children, showRightColumn = false }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // Handle sidebar toggle
  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

    return (
        <div className="flex min-h-screen bg-gradient-to-b from-green-100 to-green-300">
            {/* Left Column (Sidebar) */}
            <div
                className={`transition-transform duration-300 ${
                isSidebarOpen ? "w-64" : "w-0 lg:w-64"
                }`}
            >
                <Sidebar isOpen={isSidebarOpen} />
            </div>

            {/* Middle Column (Main Content) */}
            <div className="flex flex-1 h-screen">
                <div
                    className={`flex flex-col min-h-screen transition-all duration-300 ${
                        isSidebarOpen ? (showRightColumn ? "lg:w-[77%]" : "lg:w-full") : "w-full"
                    } overflow-y-auto no-scrollbar`}
                >
                    {/* Topbar */}
                    <div className="fixed top-0 left-0 w-full z-50">
                        <Topbar sidebarToggle={toggleSidebar} />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col min-h-screen pt-20 px-4">{children}</div>
                </div>

                    {/* Vertical Divider (Only if Right Column is enabled) */}
                    {showRightColumn && <div className="hidden lg:flex w-px bg-gray-300"></div>}

                    {/* Right Column (Only if showRightColumn is true) */}
                    {showRightColumn && (
                        <div className="hidden lg:block w-[23%] p-4 mt-16">
                            <RightColumn />
                        </div>
                    )}
            </div>
        </div>
    );
};

export default Layout;
