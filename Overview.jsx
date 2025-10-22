import React, { useState, useEffect } from "react";
import Layout from "./Layout";

const Overview = () => {
  const [adminAccount, setAdminAccount] = useState(null);
  const [transactions, setTransactions] = useState(0);

  const connectAdminMetaMask = () => {
    // Logic to connect MetaMask
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions((prev) => prev + 1);
    }, 1000); // Increment transactions every second
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout
      adminAccount={adminAccount}
      connectAdminMetaMask={connectAdminMetaMask}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Statistics Cards */}
        <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="mt-2 text-2xl font-bold">1,234</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-lg font-semibold">Active Sessions</h3>
          <p className="mt-2 text-2xl font-bold">567</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-lg font-semibold">New Registrations</h3>
          <p className="mt-2 text-2xl font-bold">89</p>
        </div>

        {/* Recent Activities */}
        <div className="col-span-1 lg:col-span-2 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-lg font-semibold">Recent Activities</h3>
          <ul className="mt-2 space-y-2">
            <li className="p-2 bg-gray-100 rounded-lg">
              User John Doe logged in
            </li>
            <li className="p-2 bg-gray-100 rounded-lg">
              User Jane Smith registered
            </li>
            <li className="p-2 bg-gray-100 rounded-lg">
              User Mike Johnson updated profile
            </li>
            {/* Add more activities here */}
          </ul>
        </div>

        {/* User Details */}
        <div className="col-span-1 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-lg font-semibold">User Details</h3>
          Ram Kumar
          <p className="mt-2">Email: Ramkumar@143gmail.com</p>
          <p className="mt-2">Role: User</p>
          {/* Add more user details here */}
        </div>

        {/* Transactions Card */}
        <div className="col-span-1 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-lg font-semibold">Transactions Done</h3>
          <p className="mt-2 text-2xl font-bold">{transactions}</p>
        </div>
      </div>
    </Layout>
  );
};

export default Overview;
