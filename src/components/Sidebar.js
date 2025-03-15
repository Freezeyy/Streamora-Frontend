import React from "react";

function Sidebar({ isOpen }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 p-4 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      } lg:translate-x-0`} // Always visible on large screens
    >
      <ul className="space-y-4 px-4 mt-20">
        <li className="hover:bg-gray-700 p-2 rounded-md cursor-pointer">Calendar</li>
        <li className="hover:bg-gray-700 p-2 rounded-md cursor-pointer">Community</li>
        <li className="hover:bg-gray-700 p-2 rounded-md cursor-pointer">Settings</li>
      </ul>
    </div>
  );
}

export default Sidebar;
