

import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        <p className="text-gray-700">Welcome to the Admin Panel. Here you can manage departments, doctors, appointments, logs, and analytics.</p>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <ul className="list-disc pl-6 text-blue-700 space-y-1">
            <li>Department Management</li>
            <li>Doctor Management</li>
            <li>Appointment Oversight</li>
            <li>System Logs</li>
            <li>Analytics & Reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 