// src/pages/Dashboard.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLogout from "./hooks/useLogout"; // Import the logout hook
import Navbar from "../components/Navbar";

import InputPost from "./posting/InputPost";
import OutputPost from "./posting/OutputPost";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useLogout(); // Get the logout function from the hook

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex">
      {/* Sidebar should be rendered here */}

      <div className="flex-1">
        <Navbar />
        <div className="flex flex-col bg-gradient-to-b from-green-100 to-green-300">
          <div className="mt-10">
            <InputPost />
            <OutputPost />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
