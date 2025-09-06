import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const DoctorLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <img className="h-8 w-8" src="/mainLogo.svg" alt="MedLink Logo" />
                <span className="font-bold text-xl text-blue-600">MedLink</span>
              </Link>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink
                    to="/doctor/dashboard"
                    className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'}`}
                  >
                    Dashboard
                  </NavLink>
                  {/* The "New Consultation" link has been removed to enforce the correct workflow */}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-800 text-sm mr-4">Welcome, Dr. {user?.name}</span>
              <button onClick={logout} className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DoctorLayout;