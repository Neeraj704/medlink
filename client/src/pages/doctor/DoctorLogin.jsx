import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../api';

const DoctorLogin = () => {
  const [hprId, setHprId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  // In a real app, you would have a separate registration flow.
  // For this basic version, we combine them. If login fails, we try to register.
  const handleLoginOrRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First, attempt to log in
      const response = await api.post('/auth/hpr/login', { hprId, password });
      login(response.data);
    } catch (err) {
      // If login fails (e.g., 404 Not Found), try to register
      if (err.response && (err.response.status === 404 || err.response.status === 401)) {
        try {
          const regResponse = await api.post('/auth/hpr/register', { hprId, password });
          login(regResponse.data);
        } catch (regErr) {
          setError(regErr.response?.data?.message || 'Registration failed. The HPR ID might be invalid or already in use with a different password.');
        }
      } else {
        setError(err.response?.data?.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <img className="mx-auto h-12 w-auto" src="/mainLogo.svg" alt="MedLink Logo" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Doctor Portal</h2>
          <p className="mt-2 text-sm text-gray-600">Login or Register with your HPR ID</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

        <form onSubmit={handleLoginOrRegister} className="space-y-6">
          <div>
            <label htmlFor="hprId" className="sr-only">HPR ID</label>
            <input id="hprId" name="hprId" type="text" value={hprId} onChange={(e) => setHprId(e.target.value)} required className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Enter your HPR ID" />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Password" />
          </div>
          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300">
              {loading ? 'Processing...' : 'Login / Register'}
            </button>
          </div>
        </form>
         <p className="mt-6 text-center text-sm text-gray-500">
            Not a doctor?{' '}
            <Link to="/login/patient" className="font-medium text-blue-600 hover:text-blue-500">
                Login as a Patient
            </Link>
        </p>
      </div>
    </div>
  );
};

export default DoctorLogin;