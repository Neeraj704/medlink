import React from 'react';
import { Link } from 'react-router-dom';

const LoginGateway = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
            <img className="mx-auto h-12 w-auto" src="/mainLogo.svg" alt="MedLink Logo" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Welcome to MedLink
            </h2>
            <p className="mt-2 text-sm text-gray-600">
                Please select your role to continue
            </p>
        </div>
        <div className="space-y-4">
            <Link to="/login/patient" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700">
                I am a Patient
            </Link>
            <Link to="/login/doctor" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700">
                I am a Doctor
            </Link>
        </div>
         <p className="mt-6 text-center text-sm text-gray-500">
            New here?{' '}
            <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
                Learn more about MedLink
            </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginGateway;