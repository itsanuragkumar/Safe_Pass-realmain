import React from "react";
import Layout from "./Layout";

const Analytics = ({ adminAccount, connectAdminMetaMask }) => {
  return (
    <Layout
      adminAccount={adminAccount}
      connectAdminMetaMask={connectAdminMetaMask}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 p-6">
        {/* Page Views Card */}
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-lg font-semibold">Page Views</h3>
          <p className="mt-2 text-2xl font-bold">12,345</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: "75%" }}
            ></div>
          </div>
        </div>

        {/* Unique Visitors Card */}
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-lg font-semibold">Unique Visitors</h3>
          <p className="mt-2 text-2xl font-bold">10000+</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>

        {/* Bounce Rate Card */}
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-lg font-semibold">Security</h3>
          <p className="mt-2 text-2xl font-bold">100%</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-red-500 rounded-full"
              style={{ width: "45%" }}
            ></div>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-lg font-semibold">Transactions</h3>
          <p className="mt-2 text-2xl font-bold">Highly Scalable</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{ width: "80%" }}
            ></div>
          </div>
        </div>

        {/* Authentication Success Rate Card */}
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-lg font-semibold">Auth Success Rate</h3>
          <p className="mt-2 text-2xl font-bold">100%</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-teal-500 rounded-full"
              style={{ width: "98%" }}
            ></div>
          </div>
        </div>

        {/* Average Response Time Card */}
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <h3 className="text-lg font-semibold">Avg Response Time</h3>
          <p className="mt-2 text-2xl font-bold">1sec</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-yellow-500 rounded-full"
              style={{ width: "90%" }}
            ></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
