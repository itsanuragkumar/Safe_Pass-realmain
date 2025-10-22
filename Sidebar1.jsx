import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-black shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Admin Dashboard</h2>
      </div>
      <nav className="p-4">
        <ul>
          <li>
            <Link
              to="/"
              className="block px-4 py-2 mt-2 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-700 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Overview
            </Link>
          </li>
          <li>
            <Link
              to="/analytics"
              className="block px-4 py-2 mt-2 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-700 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Analytics
            </Link>
          </li>
          <li>
            <Link
              to="/registration-requests"
              className="block px-4 py-2 mt-2 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-700 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Registration Requests
            </Link>
          </li>
          {/* Add more links here */}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
